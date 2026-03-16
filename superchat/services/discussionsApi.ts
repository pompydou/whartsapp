const BASE_URL = 'http://10.1.0.240:3000/api';

export interface Discussion {
  _id?: string;
  id: string;
  name: string;
  preview: string;
  time: string;
  unread: number;
  avatarColor: string;
  type: 'text' | 'voice' | 'video-call' | 'group';
  muted?: boolean;
  sent?: boolean;
  online?: boolean;
}

// Normalise _id → id pour les documents MongoDB
function normalize(d: any): Discussion {
  return { ...d, id: d._id || d.id };
}

export async function fetchDiscussions(): Promise<Discussion[]> {
  const res = await fetch(`${BASE_URL}/discussions`);
  if (!res.ok) throw new Error('Erreur lors du chargement des discussions');
  const data = await res.json();
  return data.map(normalize);
}

export async function markAsRead(id: string): Promise<void> {
  await fetch(`${BASE_URL}/discussions/${id}/read`, { method: 'PATCH' });
}

export async function sendMessage(discussionId: string, preview: string): Promise<Discussion> {
  const res = await fetch(`${BASE_URL}/discussions/${discussionId}/message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ preview }),
  });
  if (!res.ok) throw new Error('Erreur lors de l\'envoi du message');
  const data = await res.json();
  return data.discussion;
}
