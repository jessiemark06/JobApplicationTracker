<p align="center"><a href="https://laravel.com" target="_blank"><img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="400" alt="Laravel Logo"></a></p>

<p align="center">
<a href="https://github.com/laravel/framework/actions"><img src="https://github.com/laravel/framework/workflows/tests/badge.svg" alt="Build Status"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/dt/laravel/framework" alt="Total Downloads"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/v/laravel/framework" alt="Latest Stable Version"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/l/laravel/framework" alt="License"></a>
</p>

## Email Verification

New accounts must verify their email address before signing in. Configure a real SMTP provider in `backend/.env`; the default local `MAIL_MAILER=log` writes messages to Laravel's log instead of sending them.

```dotenv
APP_URL=http://127.0.0.1:8000
FRONTEND_URL=http://localhost:5173
MAIL_MAILER=smtp
MAIL_HOST=your-smtp-host
MAIL_PORT=587
MAIL_USERNAME=your-smtp-username
MAIL_PASSWORD=your-smtp-password
MAIL_FROM_ADDRESS=verified-sender@example.com
MAIL_FROM_NAME="JobTrack"
```

Use the SMTP host, port, credentials, and sender address supplied by your email provider. After changing environment settings, run `php artisan config:clear` from `backend/`. Verification links are signed and expire after 60 minutes.

## JobTrack advanced features

The advanced tracker features use an additive migration; existing company and
application rows are retained, and historical status entries are created only
for applications created or changed after the migration.

From `backend/`, back up the database and run:

```sh
php artisan migrate
php artisan config:clear
```

The migration adds application source and saved job-description fields, company
recruitment fields, and tables for status history, follow-ups, skills, saved job
requirements, private application documents, and private company research.
Document uploads accept PDF, DOC, DOCX, and TXT files up to 10 MB. Files use
Laravel's private `local` disk under `storage/app/private`; downloads require
authentication and are checked against the owning user. Do not move these files
to the public disk unless authenticated download authorization remains enforced.

The frontend exposes analytics, follow-ups, skills and target-job comparisons
under **Career tools**. Application history and private documents appear on each
application detail page; personal company research appears on the company detail
page. Skill extraction is manual, and keyword matches are not a qualification
assessment. Follow-up messages are editable/copyable only and are never sent
automatically.

To run validation:

```sh
php artisan test
```

From `frontend/`, run `npm run lint` and `npm run build`.

## Interviews, reminders, account settings, and email

The interview/event and account features are added by the incremental migration
`2026_10_29_160000_add_interview_events_and_account_preferences.php`. After
backing up the database, run `php artisan migrate` from `backend/`. This creates
the recruitment event/history, user notification, and reminder-delivery tables,
and adds only time-zone and preference columns to users.

The authenticated **Interviews & Events** page records interview and recruitment
dates against owned applications. Rescheduling and cancellation are retained in
event history. In-app event and follow-up reminders are deduplicated in the
database, and cancelled events are excluded. Application status remains
user-controlled.

The Laravel scheduler registers `jobtrack:process-reminders` every minute. For
local development, run this from `backend/` in a dedicated terminal:

```sh
php artisan schedule:work
```

You can process due reminders once for testing with:

```sh
php artisan jobtrack:process-reminders
```

Production hosting must invoke Laravel's scheduler once per minute, for example
with a cron entry:

```cron
* * * * * cd /path/to/backend && php artisan schedule:run >> /dev/null 2>&1
```

Configure the host's cron facility (such as Hostinger's cron jobs) and verify
the task's run history. The application does not claim automatic reminders are
active until this external scheduler is configured. The in-app UI may refresh
its notification count, but reminder generation is server-side.

Users opt in to email delivery separately for interviews, recruitment deadlines,
follow-ups, and application updates. Only verified account email addresses are
eligible. Use the existing Laravel mail environment settings
(`MAIL_MAILER`, `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`,
`MAIL_SCHEME`, `MAIL_FROM_ADDRESS`, and `MAIL_FROM_NAME`) and keep secrets only
in the deployment environment, never in source control. `FRONTEND_URL` is used
to form links back to JobTrack. With `MAIL_MAILER=log` or `array`, the reminder
system records an email preview status and does not send a real email; configure
and test a dedicated provider before opting in to production delivery. Delivery
failures are recorded without removing the corresponding in-app notification.

The **Profile & settings** page stores the preferred IANA time zone, default
event reminder intervals, and opt-in email preferences. Changing an email
address requires verification again. Password changes require the current
password, enforce the framework's minimum eight-character policy, hash the new
password, and revoke other personal access tokens. Password reset remains a
separate authentication workflow.

## About Laravel

Laravel is a web application framework with expressive, elegant syntax. We believe development must be an enjoyable and creative experience to be truly fulfilling. Laravel takes the pain out of development by easing common tasks used in many web projects, such as:

- [Simple, fast routing engine](https://laravel.com/docs/routing).
- [Powerful dependency injection container](https://laravel.com/docs/container).
- Multiple back-ends for [session](https://laravel.com/docs/session) and [cache](https://laravel.com/docs/cache) storage.
- Expressive, intuitive [database ORM](https://laravel.com/docs/eloquent).
- Database agnostic [schema migrations](https://laravel.com/docs/migrations).
- [Robust background job processing](https://laravel.com/docs/queues).
- [Real-time event broadcasting](https://laravel.com/docs/broadcasting).

Laravel is accessible, powerful, and provides tools required for large, robust applications.

## Learning Laravel

Laravel has the most extensive and thorough [documentation](https://laravel.com/docs) and video tutorial library of all modern web application frameworks, making it a breeze to get started with the framework. You can also check out [Laravel Learn](https://laravel.com/learn), where you will be guided through building a modern Laravel application.

If you don't feel like reading, [Laracasts](https://laracasts.com) can help. Laracasts contains thousands of video tutorials on a range of topics including Laravel, modern PHP, unit testing, and JavaScript. Boost your skills by digging into our comprehensive video library.

## Laravel Sponsors

We would like to extend our thanks to the following sponsors for funding Laravel development. If you are interested in becoming a sponsor, please visit the [Laravel Partners program](https://partners.laravel.com).

### Premium Partners

- **[Vehikl](https://vehikl.com)**
- **[Tighten Co.](https://tighten.co)**
- **[Kirschbaum Development Group](https://kirschbaumdevelopment.com)**
- **[64 Robots](https://64robots.com)**
- **[Curotec](https://www.curotec.com/services/technologies/laravel)**
- **[DevSquad](https://devsquad.com/hire-laravel-developers)**
- **[Redberry](https://redberry.international/laravel-development)**
- **[Active Logic](https://activelogic.com)**

## Contributing

Thank you for considering contributing to the Laravel framework! The contribution guide can be found in the [Laravel documentation](https://laravel.com/docs/contributions).

## Code of Conduct

In order to ensure that the Laravel community is welcoming to all, please review and abide by the [Code of Conduct](https://laravel.com/docs/contributions#code-of-conduct).

## Security Vulnerabilities

If you discover a security vulnerability within Laravel, please send an e-mail to Taylor Otwell via [taylor@laravel.com](mailto:taylor@laravel.com). All security vulnerabilities will be promptly addressed.

## License

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
