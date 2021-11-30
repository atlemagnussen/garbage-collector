export const formatterNoDateAndTime = Intl.DateTimeFormat("nb-NO", {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
})

export const formatterNoDateOnly = Intl.DateTimeFormat("nb-NO", {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
})