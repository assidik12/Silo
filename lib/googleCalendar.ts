export async function createEvent(accessToken: string, eventDetails: any) {
  const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(eventDetails),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Google API Error: ${errorData?.error?.message || 'Unknown error'}`);
  }

  return response.json();
}

export async function updateEvent(accessToken: string, eventId: string, eventDetails: any) {
  const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
    method: 'PATCH', 
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(eventDetails),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Google API Error: ${errorData?.error?.message || 'Unknown error'}`);
  }

  return response.json();
}

export async function deleteEvent(accessToken: string, eventId: string) {
  const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Google API Error: ${errorData?.error?.message || 'Unknown error'}`);
  }

  return true;
}
