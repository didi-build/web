/** Approved follow-up email signature and footer (DIDI-544 section 5). Shared by HTML and plain text. */

export const HI_FOLLOW_UP_EMAIL_LOGO_URL = "https://didi.build/email-logo.png";
export const HI_FOLLOW_UP_BOOKING_URL = "https://didi.build/book";
export const HI_FOLLOW_UP_HI_PAGE_URL = "https://didi.build/hi";

/** HTML table signature (do not restyle). */
export const HI_FOLLOW_UP_SIGNATURE_HTML = `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0;">
  <tr>
    <td style="border-left:4px solid #166534;padding-left:16px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="vertical-align:top;padding-right:14px;">
            <img src="${HI_FOLLOW_UP_EMAIL_LOGO_URL}" width="80" height="80" alt="Didi Build" style="display:block;border-radius:16px;" />
          </td>
          <td style="vertical-align:top;font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:1.55;color:#1f3d2c;">
            <strong style="color:#166534;">Diadem (Didi) Shoukralla</strong><br />
            Software Engineer and Technical Advisor<br />
            Founder, Didi Build<br />
            <a href="${HI_FOLLOW_UP_BOOKING_URL}" style="color:#166534;text-decoration:underline;">Book a call</a><br />
            <a href="mailto:diadem@didi.build" style="color:#166534;text-decoration:underline;">diadem@didi.build</a><br />
            <a href="https://didi.build" style="color:#166534;text-decoration:underline;">didi.build</a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;

/** Plain text signature block, including the `--` separator line. */
export const HI_FOLLOW_UP_SIGNATURE_PLAIN = `--
Diadem (Didi) Shoukralla
Software Engineer and Technical Advisor
Founder, Didi Build
Book a call: ${HI_FOLLOW_UP_BOOKING_URL}
diadem@didi.build
didi.build`;

export const HI_FOLLOW_UP_FOOTER_PLAIN = `You're getting this because you exchanged contact info at didi.build/hi.

This is the only email you'll get from this exchange unless you reply.

Didi Build, Toronto, Ontario`;

export const HI_FOLLOW_UP_FOOTER_HTML = `You're getting this because you exchanged contact info at <a href="${HI_FOLLOW_UP_HI_PAGE_URL}" style="color:#166534;text-decoration:underline;">didi.build/hi</a>.<br /><br />This is the only email you'll get from this exchange unless you reply.<br /><br />Didi Build, Toronto, Ontario`;
