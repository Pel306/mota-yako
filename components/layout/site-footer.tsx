import Link from "next/link";

export function SiteFooter() {
  return (
    <>
      <footer className="footer">
        <div className="container footer-grid">
          <div>
            <Link href="/" className="logo">
              <span className="logo-mark" aria-hidden="true" />
              <span className="logo-text">
                MOTA <span>YAKO</span>
              </span>
            </Link>
            <p className="small">
              A Zimbabwean car marketplace connecting buyers with private sellers and verified dealers.
            </p>
          </div>
          <div>
            <h3>Marketplace</h3>
            <Link href="/cars">Find cars</Link>
            <Link href="/dealers">Dealers</Link>
            <Link href="/cars/sell">List your car</Link>
          </div>
          <div>
            <h3>Trust</h3>
            <Link href="/trust#kyc-verified">Seller verification</Link>
            <Link href="/trust#buyer-support">Buyer support</Link>
            <Link href="/trust#safe-enquiries">Safe enquiries</Link>
          </div>
          <div>
            <h3>Contact</h3>
            <a href="https://wa.me/263777183773">WhatsApp +263 777 183 773</a>
            <a href="mailto:support@motayako.co.zw">support@motayako.co.zw</a>
          </div>
        </div>
        <div className="container footer-bottom">
          © 2026 Mota Yako. USD pricing · Zimbabwe locale · Accessible marketplace. ·{" "}
          <Link href="/terms">Terms</Link> · <Link href="/admin">Admin demo</Link>
        </div>
      </footer>
      <a
        className="sticky-whatsapp"
        href="https://wa.me/263777183773"
        aria-label="Chat with Mota Yako on WhatsApp"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.35 5.07L2 22l5.05-1.32A9.94 9.94 0 0 0 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm5.2 14.3c-.22.62-1.27 1.19-1.75 1.24-.45.05-.9.2-3.02-.63-2.56-1-4.18-3.62-4.3-3.79-.13-.17-1.03-1.37-1.03-2.62 0-1.24.65-1.85.88-2.1.22-.24.48-.3.65-.3.16 0 .32 0 .46.01.15.01.35-.06.55.42.22.53.73 1.83.8 1.96.06.13.1.28.02.45-.08.17-.13.28-.25.43-.13.15-.27.34-.38.46-.13.13-.27.27-.11.53.15.27.68 1.12 1.46 1.81 1 .89 1.85 1.17 2.11 1.3.27.13.42.11.58-.07.16-.18.68-.8.86-1.07.18-.27.36-.22.6-.13.25.09 1.58.75 1.85.88.27.13.45.2.51.31.07.12.07.66-.15 1.28z" />
        </svg>
        <span>WhatsApp us</span>
      </a>
    </>
  );
}
