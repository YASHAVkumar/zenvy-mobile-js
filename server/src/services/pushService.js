async function sendChatPush(db, recipientId, senderName, conversationId) {
  const devices = db.prepare('SELECT id,push_token FROM push_devices WHERE user_id = ?').all(recipientId);
  if (!devices.length) return;
  const response = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: { Accept: 'application/json', 'Accept-Encoding': 'gzip, deflate', 'Content-Type': 'application/json' },
    body: JSON.stringify(devices.map((device) => ({
      to: device.push_token,
      title: `A note from ${senderName}`,
      body: 'You have a new Zenvy message.',
      channelId: 'style-updates',
      data: { route: `/chat/${conversationId}` },
    }))),
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error(`Expo Push Service returned ${response.status}.`);
  const result = await response.json();
  for (const [index, ticket] of (result.data || []).entries()) {
    if (ticket.status === 'error' && ticket.details?.error === 'DeviceNotRegistered') {
      db.prepare('DELETE FROM push_devices WHERE id = ?').run(devices[index]?.id);
    }
  }
}

module.exports = { sendChatPush };
