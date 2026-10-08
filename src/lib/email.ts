const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.iskole.online";

export function emailLayout(content: string): string {
  return `<!doctype html>
<html lang="en">
  <body style="margin:0;background:#f8f7fc;color:#211f26;font-family:Arial,Helvetica,sans-serif;">
    <div style="padding:40px 16px;">
      <div style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #e7e4ee;border-radius:20px;overflow:hidden;">
        <div style="padding:28px 32px;border-bottom:1px solid #eeeaf5;">
          <a href="${SITE_URL}" style="text-decoration:none;color:#7c3aed;font-size:22px;font-weight:800;">
            iSkole
          </a>
        </div>
        <div style="padding:32px;">
          ${content}
        </div>
        <div style="padding:20px 32px;background:#faf9fc;border-top:1px solid #eeeaf5;color:#77727f;font-size:12px;line-height:1.6;">
          You received this email from iSkole because of activity on your account.
          <br />
          <a href="${SITE_URL}" style="color:#7c3aed;text-decoration:none;">iskole.online</a>
        </div>
      </div>
    </div>
  </body>
</html>`;
}

export function primaryButton(label: string, href: string): string {
  return `<a href="${href}" style="display:inline-block;padding:12px 20px;background:#7c3aed;color:#ffffff;text-decoration:none;border-radius:10px;font-weight:700;font-size:14px;">${label}</a>`;
}
