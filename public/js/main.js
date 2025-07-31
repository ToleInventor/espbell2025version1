const loadBtn = document.getElementById('loadEventsBtn');
const eventList = document.getElementById('eventList');
const eventForm = document.getElementById('eventForm');
const eventIdInput = document.getElementById('eventId');
const eventDescInput = document.getElementById('eventDescription');

loadBtn.addEventListener('click', async () => {
  eventList.innerHTML = 'Loading...';
  try {
    const res = await fetch('/api/events');
    if (!res.ok) throw new Error(`Failed to fetch events (${res.status})`);
    const events = await res.json();
    if (!events.length) {
      eventList.innerHTML = '<li>No events found</li>';
      return;
    }
    eventList.innerHTML = '';
    for (const id of events) {
      const li = document.createElement('li');
      li.textContent = id;
      eventList.appendChild(li);
    }
  } catch (err) {
    eventList.innerHTML = `<li>Error: ${err.message}</li>`;
  }
});

eventForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = eventIdInput.value.trim();
  const description = eventDescInput.value.trim();

  if (!id) {
    alert('ID is required');
    return;
  }

  try {
    const res = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, description }),
    });
    const data = await res.json();
    if (!res.ok) {
      alert('Error: ' + (data.error || 'Failed to create event'));
      return;
    }
    alert(`Event "${id}" created successfully!`);
    eventForm.reset();
  } catch (err) {
    alert('Error creating event: ' + err.message);
  }
});
