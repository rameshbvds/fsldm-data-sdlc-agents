# Resume Asset Drop

Place Ramesh's PDF resume at `web/public/ramesh-resume.pdf`. The "Download Resume" button
on `/built-by/ramesh` links to `/ramesh-resume.pdf` (served by Next.js as a static asset).

For a profile photo, drop `ramesh.jpg` (or `.png`) at `web/public/ramesh.jpg` and replace
the `<span>RV</span>` monogram in `app/built-by/ramesh/page.tsx` and `app/about/page.tsx`
with `<Image src="/ramesh.jpg" ... />` (next/image).
