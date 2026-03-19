/** Log admin activity for dashboard. Call after successful admin actions. */
export async function logAdminActivity(params: {
  activity_type: string;
  title: string;
  entity_type: string;
  entity_id?: string | null;
  href: string;
}) {
  try {
    await fetch('/api/admin/activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
  } catch (e) {
    console.warn('Failed to log admin activity:', e);
  }
}
