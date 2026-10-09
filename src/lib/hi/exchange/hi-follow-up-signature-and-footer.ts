/** Approved follow-up email signature and footer (DIDI-544 section 5). Shared by HTML and plain text. */

export const HI_FOLLOW_UP_EMAIL_LOGO_URL = "https://didi.build/email-logo.png";
export const HI_FOLLOW_UP_BOOKING_URL = "https://didi.build/book";
export const HI_FOLLOW_UP_HI_PAGE_URL = "https://didi.build/hi";

/** HTML table signature (approved; do not restyle). */
export const HI_FOLLOW_UP_SIGNATURE_HTML = `<table cellpadding="0" cellspacing="0" border="0" role="presentation" style="font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.45;color:#1f2a24;border-collapse:collapse;"><tr><td style="vertical-align:middle;padding:0 14px 0 0;"><img src="https://didi.build/email-logo.png" width="80" height="80" alt="Didi Build" style="display:block;width:80px;height:80px;border:0;"></td><td style="vertical-align:middle;padding:0 0 0 14px;border-left:2px solid #8fd19e;"><div style="font-size:14px;font-weight:bold;color:#1f2a24;">Diadem (Didi) Shoukralla</div><div style="color:#1f2a24;">Founder, Didi Build</div><div style="color:#5b6b62;">Software Engineer and Technical Advisor</div><div style="padding-top:4px;"><a href="https://didi.build" style="color:#1e4630;font-weight:bold;text-decoration:none;">didi.build</a></div><div>Book a call: <a href="https://didi.build/book" style="color:#1e4630;text-decoration:underline;">didi.build/book</a></div></td></tr></table>`;

/** Plain text signature block, including the `--` separator line (approved; do not restyle). */
export const HI_FOLLOW_UP_SIGNATURE_PLAIN = `--
Diadem (Didi) Shoukralla
Founder, Didi Build
Software Engineer and Technical Advisor
didi.build
Book a call: didi.build/book`;

export const HI_FOLLOW_UP_FOOTER_PLAIN = `You're getting this because you exchanged contact info at didi.build/hi.

This is the only email you'll get from this exchange unless you reply.

Didi Build, Toronto, Ontario`;

export const HI_FOLLOW_UP_FOOTER_HTML = `You're getting this because you exchanged contact info at <a href="${HI_FOLLOW_UP_HI_PAGE_URL}" style="color:#166534;text-decoration:underline;">didi.build/hi</a>.<br /><br />This is the only email you'll get from this exchange unless you reply.<br /><br />Didi Build, Toronto, Ontario`;
