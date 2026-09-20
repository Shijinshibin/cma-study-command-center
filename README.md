# CMA Study Command Center — Live Google Sheets Edition

A configurable CMA Final study/revision dashboard with a live exam countdown, cumulative study-hour target, study timer, daily plan, subject tracking, MCQ/test analysis, and a Google Apps Script backend.

## Run locally

```powershell
npm install
npm run dev
```

Open the Vite URL shown in the terminal (normally `http://localhost:3000`).

## Live Google Sheets backend

The frontend is already configured to use the supplied Apps Script URL:

`https://script.google.com/macros/s/AKfycbyJ-vFwT5rzDP1UbMs9DDa2X3CDumUWbsqjIy5DFJzKNmN40gC6OaIbwNSWK2QHm9uF/exec`

The frontend:
- saves meaningful changes to the backend automatically;
- pulls the latest sheet data every 10 seconds;
- has a **Sync now** button;
- shows LIVE / SAVING / OFFLINE status and the last sync time.

### Required Apps Script contract

The deployed URL must run the `Code.gs` included in this project. If the supplied URL was created from another script, replace its code with `Code.gs`, then deploy it again as a Web App:

1. Open the Google Sheet that should store the data.
2. Extensions → Apps Script.
3. Replace the script with `Code.gs` from this project.
4. If the Apps Script is bound to the spreadsheet, leave `SPREADSHEET_ID` empty.
5. If it is a standalone script, put the Google Sheet ID into `SPREADSHEET_ID`.
6. Deploy → New deployment → Web app.
7. Execute as **Me**.
8. Who has access: **Anyone**.
9. Copy the `/exec` URL into `src/main.tsx` as `SHEETS_API_URL` if the deployment URL changed.

The backend creates these tabs:

- `StudyOS_Config`
- `StudyOS_Subjects`
- `StudyOS_Tasks`
- `StudyOS_Sessions`
- `StudyOS_Tests`

### Data flow

```text
Study website
    ↕ every 10 seconds / on save
Google Apps Script Web App
    ↕
Google Sheet tabs
```

The 425-hour master target is cumulative. Example: 2h today → 2h studied / 423h remaining; 5h tomorrow → 7h studied / 418h remaining.

## Future profiles

The UI/data model is separated so the same system can later support an MBBS profile without rebuilding the CMA dashboard.


## Added in this version
- Daily CMA task seed for Sep 20–25 plus the supplied first-revision tasks.
- Stage 1 live target: 4h 25m, with live completed/remaining progress.
- Breakfast 08:00–09:00, Lunch 13:00–14:00, Dinner 20:00–21:00.
- Water reminder and editable ITAS reminder.
- Reminder settings are saved through the Google Sheets backend in `StudyOS_Reminders`.
