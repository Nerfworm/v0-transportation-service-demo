export function proxy() {
	// Proxy temporarily disabled
	return Response.next?.() ?? undefined;
}
// import { NextResponse, type NextRequest } from "next/server";

// export function proxy(req: NextRequest) {
//   const session = req.cookies.get("session")?.value;

//   // Block forced browsing if no custom session cookie exists
//   if (!session) {
//     const url = req.nextUrl.clone();
//     url.pathname = "/staff-login";
//     url.searchParams.set("redirectedFrom", req.nextUrl.pathname);
//     return NextResponse.redirect(url);
//   }

//   return NextResponse.next();
// }

// // Protect dashboard routes
// export const config = {
//   matcher: ["/dashboard/:path*"],
// };
