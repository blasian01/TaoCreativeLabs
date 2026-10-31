// Publication source dates are the publishing calendar's America/New_York days.
export function publishingDay(value:string){
 if(/^\d{4}-\d{2}-\d{2}$/.test(value))return value;
 const date=new Date(value);if(!Number.isFinite(date.getTime()))return '';
 const parts=Object.fromEntries(new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(date).map(p=>[p.type,p.value]));
 return `${parts.year}-${parts.month}-${parts.day}`;
}
