<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Admin Dashboard | LLCC Portal</title>
    <style>
        :root { color-scheme: light; --navy: #172554; --blue: #2563eb; --ink: #172033; --muted: #64748b; --line: #e2e8f0; --bg: #f5f7fb; }
        * { box-sizing: border-box; }
        body { margin: 0; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: var(--ink); background: var(--bg); }
        header { background: var(--navy); color: white; padding: 22px max(20px, calc((100% - 1120px) / 2)); display: flex; align-items: center; justify-content: space-between; gap: 16px; }
        header h1 { margin: 0; font-size: 20px; } header p { margin: 5px 0 0; color: #cbd5e1; font-size: 13px; }
        .logout { background: transparent; border: 1px solid #94a3b8; color: white; border-radius: 9px; padding: 9px 13px; cursor: pointer; }
        main { width: min(1120px, calc(100% - 32px)); margin: 28px auto; }
        .intro { margin-bottom: 22px; } .intro h2 { margin: 0 0 6px; font-size: 26px; } .intro p { color: var(--muted); margin: 0; }
        .grid { display: grid; grid-template-columns: minmax(280px, 360px) minmax(0, 1fr); gap: 20px; align-items: start; }
        .card { background: white; border: 1px solid var(--line); border-radius: 16px; padding: 22px; box-shadow: 0 5px 20px rgba(15,23,42,.04); }
        .card h3 { margin: 0 0 6px; font-size: 18px; } .sub { margin: 0 0 20px; color: var(--muted); font-size: 13px; line-height: 1.5; }
        label { display: block; font-size: 13px; font-weight: 650; margin: 14px 0 7px; }
        input { width: 100%; border: 1px solid #cbd5e1; border-radius: 9px; padding: 11px 12px; font: inherit; background: white; }
        input:focus { outline: 3px solid #bfdbfe; border-color: var(--blue); }
        .primary { width: 100%; border: 0; border-radius: 9px; background: var(--blue); color: white; font-weight: 650; padding: 12px; margin-top: 18px; cursor: pointer; }
        .notice { border-radius: 10px; padding: 12px 14px; margin-bottom: 16px; font-size: 14px; } .success { background: #dcfce7; color: #166534; } .error { background: #fee2e2; color: #991b1b; }
        .errors { color: #b91c1c; font-size: 12px; margin-top: 5px; }
        .table-wrap { overflow-x: auto; } table { width: 100%; border-collapse: collapse; font-size: 13px; min-width: 440px; }
        th, td { text-align: left; padding: 13px 10px; border-bottom: 1px solid var(--line); } th { color: var(--muted); font-weight: 650; background: #f8fafc; }
        .count { display: inline-flex; border-radius: 999px; padding: 4px 9px; background: #dbeafe; color: #1d4ed8; font-size: 12px; font-weight: 700; }
        .empty { color: var(--muted); padding: 22px 0; text-align: center; }
        @media (max-width: 760px) { header { padding: 18px 16px; } .grid { grid-template-columns: 1fr; } main { margin-top: 20px; } .card { padding: 18px; } .intro h2 { font-size: 23px; } }
    </style>
</head>
<body>
<header>
    <div><h1>LLCC Portal</h1><p>Administrator dashboard</p></div>
    <form method="POST" action="/admin/logout">@csrf<button class="logout" type="submit">Log out</button></form>
</header>
<main>
    <div class="intro"><h2>Teacher Account Management</h2><p>Create teacher logins and view the accounts registered in the portal.</p></div>
    @if (session('success')) <div class="notice success">{{ session('success') }}</div> @endif
    @if ($errors->any())
        <div class="notice error">Please check the form:
            <ul style="margin-bottom:0">@foreach ($errors->all() as $error)<li>{{ $error }}</li>@endforeach</ul>
        </div>
    @endif
    <div class="grid">
        <section class="card">
            <h3>Create teacher account</h3>
            <p class="sub">The account will be assigned the Teacher role automatically. Passwords are stored securely as hashes.</p>
            <form method="POST" action="/admin/teachers">
                @csrf
                <label for="name">Full name</label>
                <input id="name" name="name" value="{{ old('name') }}" autocomplete="name" required maxlength="120">
                @error('name')<div class="errors">{{ $message }}</div>@enderror
                <label for="email">Email address</label>
                <input id="email" name="email" type="email" value="{{ old('email') }}" autocomplete="email" required maxlength="255">
                @error('email')<div class="errors">{{ $message }}</div>@enderror
                <label for="phone">Phone number</label>
                <input id="phone" name="phone" type="tel" value="{{ old('phone') }}" autocomplete="tel" required maxlength="30">
                @error('phone')<div class="errors">{{ $message }}</div>@enderror
                <label for="password">Temporary password</label>
                <input id="password" name="password" type="password" autocomplete="new-password" required minlength="8">
                <label for="password_confirmation">Confirm password</label>
                <input id="password_confirmation" name="password_confirmation" type="password" autocomplete="new-password" required minlength="8">
                <button class="primary" type="submit">Create teacher account</button>
            </form>
        </section>
        <section class="card">
            <h3>Teacher accounts <span class="count">{{ $teachers->count() }}</span></h3>
            <p class="sub">Only account details needed for management are shown. Passwords are never displayed.</p>
            @if ($teachers->isEmpty())
                <div class="empty">No teacher accounts yet. Create the first one using the form.</div>
            @else
                <div class="table-wrap"><table>
                    <thead><tr><th>Name</th><th>Email</th><th>Phone</th></tr></thead>
                    <tbody>@foreach ($teachers as $teacher)
                        <tr><td>{{ $teacher->name }}</td><td>{{ $teacher->email }}</td><td>{{ $teacher->phone ?: '—' }}</td></tr>
                    @endforeach</tbody>
                </table></div>
            @endif
        </section>
    </div>

    <section class="card" style="margin-top:20px;">
        <h3>Student class assignments <span class="count">{{ $students->count() }}</span></h3>
        <p class="sub">Assign each registered student to the correct year level and section. These changes are saved to the student's account and used by attendance.</p>
        @if ($students->isEmpty())
            <div class="empty">No student accounts yet. Register a student or seed demo students in your local development environment.</div>
        @else
            <div class="table-wrap"><table style="min-width:760px;">
                <thead><tr><th>Student</th><th>Email</th><th colspan="3">Year level and section assignment</th></tr></thead>
                <tbody>
                    @foreach ($students as $student)
                        <tr>
                            <td>{{ $student->name }}</td>
                            <td>{{ $student->email }}</td>
                            <td colspan="3">
                                <form method="POST" action="/admin/students/{{ $student->id }}/class" style="display:grid;grid-template-columns:minmax(130px,1fr) minmax(130px,1fr) auto;gap:8px;align-items:center;min-width:500px;">
                                    @csrf
                                    @method('PUT')
                                    <label style="margin:0;">
                                        <span style="display:block;margin-bottom:5px;">Year level</span>
                                        <select name="year_level" required style="width:100%;padding:9px;border:1px solid #cbd5e1;border-radius:8px;background:white;">
                                            <option value="">Choose year</option>
                                            @foreach ($yearLevels as $yearLevel)
                                                <option value="{{ $yearLevel }}" @selected(old('year_level', $student->year_level) === $yearLevel)>{{ $yearLevel }}</option>
                                            @endforeach
                                        </select>
                                    </label>
                                    <label style="margin:0;">
                                        <span style="display:block;margin-bottom:5px;">Section</span>
                                        <select name="class_name" required style="width:100%;padding:9px;border:1px solid #cbd5e1;border-radius:8px;background:white;">
                                            <option value="">Choose section</option>
                                            @foreach ($studentClasses as $studentClass)
                                                <option value="{{ $studentClass }}" @selected(old('class_name', $student->class_name) === $studentClass)>{{ $studentClass }}</option>
                                            @endforeach
                                        </select>
                                    </label>
                                    <button type="submit" style="border:0;border-radius:8px;background:var(--blue);color:white;font-weight:650;padding:10px 12px;cursor:pointer;">Save</button>
                                </form>
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table></div>
        @endif
    </section>
</main>
</body>
</html>
