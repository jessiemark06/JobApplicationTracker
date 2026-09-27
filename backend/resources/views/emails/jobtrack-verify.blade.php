<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Verify your JobTrack email</title>
</head>
<body style="margin:0;background:#f3f5f7;color:#17212b;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f5f7;padding:36px 16px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border:1px solid #e3e8ec;border-radius:12px;overflow:hidden;">
                    <tr>
                        <td style="background:#102b3f;padding:24px 32px;color:#ffffff;font-size:22px;font-weight:700;">JobTrack</td>
                    </tr>
                    <tr>
                        <td style="padding:36px 32px 24px;">
                            <h1 style="margin:0 0 18px;font-size:24px;line-height:1.3;color:#17212b;">Confirm your email</h1>
                            <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">Hello {{ $name }},</p>
                            <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#4b5965;">Thanks for creating a JobTrack account. Confirm this email address to start tracking your job applications.</p>
                            <p style="margin:0 0 24px;">
                                <a href="{{ $verificationUrl }}" style="display:inline-block;background:#126b63;border-radius:7px;padding:13px 20px;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;">Verify email address</a>
                            </p>
                            <p style="margin:0 0 12px;font-size:13px;line-height:1.6;color:#697783;">This button expires in 60 minutes. If it expires, request another verification email from JobTrack.</p>
                            <p style="margin:0;font-size:13px;line-height:1.6;color:#697783;">If you did not create a JobTrack account, you can ignore this message.</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="border-top:1px solid #edf0f2;padding:18px 32px;color:#7b8790;font-size:12px;">JobTrack · Job application tracking</td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>