const formatterNoShortDate = Intl.DateTimeFormat("nb-NO", {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
})

export const formatNoShortDate = (date: string | Date) => {
    const d = new Date(date)
    const formatted = formatterNoShortDate.format(d)
    return formatted
}