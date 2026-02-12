import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url: reqUrl }) => {
	const target = reqUrl.searchParams.get('url');
	if (!target) {
		return new Response('Missing url', { status: 400 });
	}
	let parsed: URL;
	try {
		parsed = new URL(target);
	} catch {
		return new Response('Invalid url', { status: 400 });
	}
	if (parsed.protocol !== 'https:') {
		return new Response('Only https allowed', { status: 400 });
	}
	const res = await fetch(target, {
		headers: { 'user-agent': 'xkeen-dat-parser/1.0' }
	});
	if (!res.ok) {
		return new Response(null, { status: res.status });
	}
	const buffer = await res.arrayBuffer();
	return new Response(buffer, {
		headers: {
			'content-type': res.headers.get('content-type') ?? 'application/octet-stream'
		}
	});
};
