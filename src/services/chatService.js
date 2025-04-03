const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTc0MzY2NTE0MiwianRpIjoiYTMyNDk4NmMtMjJkZS00ZmViLWE5YmYtYzNjMzg5ZDk3NTA0IiwidHlwZSI6ImFjY2VzcyIsInN1YiI6eyJhcGlfa2V5IjoiNzQ3YzVjYjkxNTE5MzZjZjI4MzlhYzNhZDE4ZTI4MDUxYmI4NmQ1MWQxNTM2OTM3YzgxNTY1NzM3MWQzNDM3ZSJ9LCJuYmYiOjE3NDM2NjUxNDJ9.7Lpg7u7NvDrhtDXI0BBjEcKOuQ_920cmEOzIr-yJo7o';
const UUID = '74eeba3552ad4cb0903ceb520cac83b6';

export const sendMessage = async (message) => {
  try {
    const response = await fetch('https://api.chat-service.com/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'X-UUID': UUID
      },
      body: JSON.stringify({
        message: message,
        uuid: UUID
      })
    });

    if (!response.ok) {
      throw new Error('Errore nella risposta del server');
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('Errore durante l\'invio del messaggio:', error);
    throw error;
  }
}; 