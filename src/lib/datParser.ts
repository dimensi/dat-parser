import protobuf from 'protobufjs';
import protoRaw from './geo/geosite.proto?raw';
import geoipProtoRaw from './geo/geoip.proto?raw';

/** Domain matching type (v2ray geosite). */
export type DomainType = 'Plain' | 'Regex' | 'RootDomain' | 'Full';

const DOMAIN_TYPE_NAMES: DomainType[] = ['Plain', 'Regex', 'RootDomain', 'Full'];

export interface DomainAttribute {
	key: string;
	boolValue?: boolean;
	intValue?: number;
}

export interface DomainEntry {
	type: number;
	value: string;
	attribute?: DomainAttribute[];
}

export interface GeoSiteEntry {
	countryCode: string;
	domain?: DomainEntry[];
}

export interface GeoSiteListResult {
	entry?: GeoSiteEntry[];
}

/** CIDR from GeoIP .dat (camelCase from decode). */
export interface CidrEntry {
	ip: Uint8Array;
	prefix: number;
}

export interface GeoIPEntry {
	countryCode: string;
	cidr?: CidrEntry[];
	inverseMatch?: boolean;
}

export interface GeoIPListResult {
	entry?: GeoIPEntry[];
}

export type DatFileResult =
	| { kind: 'geosite'; data: GeoSiteListResult }
	| { kind: 'geoip'; data: GeoIPListResult };

let GeoSiteListType: protobuf.Type | null = null;
let GeoIPListType: protobuf.Type | null = null;

function getGeoSiteListType(): protobuf.Type {
	if (GeoSiteListType) return GeoSiteListType;
	const root = protobuf.parse(protoRaw).root;
	const list = root.lookupType('GeoSiteList');
	if (!list) throw new Error('GeoSiteList type not found in proto');
	GeoSiteListType = list;
	return list;
}

function getGeoIPListType(): protobuf.Type {
	if (GeoIPListType) return GeoIPListType;
	const root = protobuf.parse(geoipProtoRaw).root;
	const list = root.lookupType('GeoIPList');
	if (!list) throw new Error('GeoIPList type not found in proto');
	GeoIPListType = list;
	return list;
}

/**
 * Decode domain type enum number to label.
 */
export function domainTypeName(type: number): DomainType {
	return DOMAIN_TYPE_NAMES[type] ?? 'Plain';
}

/**
 * Format CIDR for display: "1.2.3.4/24" or "2001:db8::/32".
 */
export function cidrToString(ip: Uint8Array, prefix: number): string {
	if (ip.length === 4) {
		const a = Array.from(ip).join('.');
		return `${a}/${prefix}`;
	}
	if (ip.length === 16) {
		const parts: string[] = [];
		for (let i = 0; i < 16; i += 2) {
			parts.push(((ip[i]! << 8) | ip[i + 1]!).toString(16));
		}
		const s = parts.join(':').replace(/(^|:)0+($|:)/g, '$1::$2').replace(/:{2,}/g, '::');
		return `${s}/${prefix}`;
	}
	return `?/${prefix}`;
}

/**
 * Parse a binary .dat (geosite) buffer into GeoSiteList.
 */
export function parseDatFile(buffer: ArrayBuffer): GeoSiteListResult {
	const type = getGeoSiteListType();
	const uint8 = new Uint8Array(buffer);
	const decoded = type.decode(uint8);
	return type.toObject(decoded, { longs: Number }) as GeoSiteListResult;
}

/**
 * Parse a binary .dat (geoip) buffer into GeoIPList.
 */
export function parseGeoipFile(buffer: ArrayBuffer): GeoIPListResult {
	const type = getGeoIPListType();
	const uint8 = new Uint8Array(buffer);
	const decoded = type.decode(uint8);
	const obj = type.toObject(decoded, {
		longs: Number,
		bytes: Array
	}) as { entry?: Array<{ countryCode?: string; cidr?: Array<{ ip: number[]; prefix: number }>; inverseMatch?: boolean }> };
	const entry = obj.entry ?? [];
	const normalized: GeoIPEntry[] = entry.map((e) => ({
		countryCode: e.countryCode ?? '',
		cidr: (e.cidr ?? []).map((c) => ({
			ip: new Uint8Array(c.ip),
			prefix: c.prefix ?? 0
		})),
		inverseMatch: e.inverseMatch
	}));
	return { entry: normalized };
}

/**
 * Try GeoSite first, then GeoIP. Returns union with kind.
 */
export function parseDatFileAuto(buffer: ArrayBuffer): DatFileResult {
	try {
		const data = parseDatFile(buffer);
		if (data.entry?.length) return { kind: 'geosite', data };
	} catch {
		// not geosite
	}
	const data = parseGeoipFile(buffer);
	return { kind: 'geoip', data };
}

const DEFAULT_ZKEEN_URL =
	'https://github.com/jameszeroX/zkeen-domains/releases/latest/download/zkeen.dat';

/**
 * Load and parse a .dat file from URL.
 */
export async function loadFromUrl(
	url: string = DEFAULT_ZKEEN_URL
): Promise<GeoSiteListResult> {
	const res = await fetch(url);
	if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
	const buffer = await res.arrayBuffer();
	return parseDatFile(buffer);
}

export { DEFAULT_ZKEEN_URL };
