<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Email verified | JobTrack</title>
    <style>
        body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #f3f4f6; color: #111827; font: 16px system-ui, sans-serif; }
        main { width: min(420px, calc(100% - 40px)); padding: 36px; border: 1px solid #e5e7eb; border-radius: 12px; background: white; text-align: center; }
        h1 { margin: 0 0 12px; font-size: 24px; }
        p { color: #4b5563; line-height: 1.6; }
        a { display: inline-block; margin-top: 12px; padding: 11px 18px; border-radius: 7px; background: #0f172a; color: white; text-decoration: none; }
    </style>
</head>
<body>
    <main>
        <h1>Email verified</h1>
        <p>Your JobTrack account is confirmed. You can now sign in.</p>
        <a href="{{ $loginUrl }}">Continue to sign in</a>
    </main>
</body>
</html>