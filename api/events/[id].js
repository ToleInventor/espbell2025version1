import fetch from 'node-fetch';

const BLOB_API_BASE = 'https://blob.vercel-storage.com/v1/blob';
const BLOB_TOKEN = vercel_blob_rw_ykX78001m3aY6vyi_8Zv0UHQswSL1JRKdwPuSC0gDe3lVvE;

const HEADERS = {
  Authorization: `Bearer ${BLOB_TOKEN}`,
};

export default async function handler(req, res) {
  const {
    query: { id },
    method,
  } = req;

  if (!id) {
    return res.status(400).json({ error: 'Event id is required in URL' });
  }

  const path = `events/${id}.json`;

  if (method === 'GET') {
    try {
      const blobResponse = await fetch(`${BLOB_API_BASE}/${path}`, {
        headers: HEADERS,
      });
      if (blobResponse.status === 404) {
        return res.status(404).json({ error: 'Event not found' });
      }
      if (!blobResponse.ok) {
        const errText = await blobResponse.text();
        return res.status(blobResponse.status).json({ error: 'Failed to fetch event', details: errText });
      }
      const content = await blobResponse.text();
      res.setHeader('Content-Type', 'application/json');
      return res.status(200).send(content);
    } catch (err) {
      return res.status(500).json({ error: 'Error fetching event', details: err.message });
    }
  } else if (method === 'DELETE') {
    try {
      const delResponse = await fetch(`${BLOB_API_BASE}/${path}`, {
        method: 'DELETE',
        headers: HEADERS,
      });
      if (delResponse.status === 404) {
        return res.status(404).json({ error: 'Event not found' });
      }
      if (delResponse.status !== 204) {
        const errText = await delResponse.text();
        return res.status(delResponse.status).json({ error: 'Failed to delete event', details: errText });
      }
      return res.status(200).json({ message: 'Event deleted' });
    } catch (err) {
      return res.status(500).json({ error: 'Error deleting event', details: err.message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'DELETE']);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
}
