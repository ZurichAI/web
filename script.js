function updateClockAndDate() {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    const dateString = now.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
    
    const clockElement = document.getElementById('clock');
    clockElement.textContent = timeString;
    const dateElement = document.getElementById('date');
    dateElement.textContent = dateString;
}
setInterval(updateClockAndDate, 1000);
updateClockAndDate();