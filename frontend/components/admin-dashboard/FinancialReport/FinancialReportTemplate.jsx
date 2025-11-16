// components/admin-dashboard/FinancialReport/FinancialReportTemplate.jsx
export function renderReportHtml(data = {}, title = 'Usage Report') {
  const from = data?.from || '';
  const to = data?.to || '';
  const formatNumber = (n) => (typeof n === 'number' ? n.toLocaleString() : n ?? '-');
  const formatDateRange = (a, b) => (!a && !b ? 'Last 30 days' : `${a || '-'} → ${b || '-'}`);

  return `
    <html>
    <head>
      <meta charset="utf-8" />
      <title>${title}</title>
      <style>
        body { font-family: Arial, Helvetica, sans-serif; padding: 24px; color:#111 }
        .header { display:flex; justify-content:space-between; align-items:center }
        .title { font-size:20px; font-weight:700 }
        .meta { color: #555 }
        table { width:100%; border-collapse: collapse; margin-top:16px }
        th, td { padding:12px 8px; border-bottom:1px solid #e5e7eb; text-align:left }
        th { background:#f8fafc; color:#111; font-weight:600 }
        .kv { width: 60% }
        .val { width: 40%; text-align:right }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="title">${title}</div>
          <div class="meta">Range: ${formatDateRange(from, to)}</div>
        </div>
        <div class="meta">Generated: ${new Date().toLocaleString()}</div>
      </div>

      <table>
        <thead>
          <tr>
            <th class="kv">Metric</th>
            <th class="val">Value</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Active Users</td><td style="text-align:right">${formatNumber(data?.activeUsers)}</td></tr>
          <tr><td>New Users</td><td style="text-align:right">${formatNumber(data?.newUsers)}</td></tr>
          <tr><td>Bookings Count</td><td style="text-align:right">${formatNumber(data?.bookingsCount)}</td></tr>
          <tr><td>Hosts Onboarded</td><td style="text-align:right">${formatNumber(data?.hostsOnboarded)}</td></tr>
          <tr><td>Reviews Count</td><td style="text-align:right">${formatNumber(data?.reviewsCount)}</td></tr>
        </tbody>
      </table>

      <div style="margin-top:28px; color:#666; font-size:12px">Note: Data shown is from the API endpoint <code>/admin/reports/usage</code>.</div>
    </body>
    </html>
  `;
}

export default renderReportHtml;
