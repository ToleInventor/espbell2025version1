import fetch from 'node-fetch';

const BLOB_API_BASE = 'https://blob.vercel-storage.com/v1/blob';
const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

const HEADERS = {
  Authorization: `Bearer ${BLOB_TOKEN}`,
  'Content-Type': 'application/json',
};

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const response = await fetch('https://blob.vercel-storage.com/v1/list?prefix=events/', {
        headers: HEADERS,
      });
      if (!response.ok) {
        const errorText = await response.text();
        return res.status(response.status).json({ error: errorText });
      }
      const data = await response.json();
      const eventIds = (data.items || [])
        .filter(item => item.name.endsWith('.json'))
        .map(item => item.name.slice('events/'.length, -5));
      return res.status(200).json(eventIds);
    } catch (err) {
      return res.status(500).json({ error: 'Error listing blobs', details: err.message });
    }
  } else if (req.method === 'POST') {
    const event = req.body;
    if (!event || !event.id) {
      return res.status(400).json({ error: "'id' is required in the event object" });
    }
    try {
      const path = `events/${event.id}.json`;
      const putResponse = await fetch(`${BLOB_API_BASE}/${path}`, {
        method: 'PUT',
        headers: HEADERS,
        body: JSON.stringify(event),
      });
      if (!putResponse.ok) {
        const errorText = await putResponse.text();
        return res.status(putResponse.status).json({ error: 'Failed to upload event', details: errorText });
      }
      return res.status(201).json({ message: 'Event stored', id: event.id });
    } catch (err) {
      return res.status(500).json({ error: 'Error storing event', details: err.message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
