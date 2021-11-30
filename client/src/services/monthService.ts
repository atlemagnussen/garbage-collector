export const getMonthWeeks = (year: number, month: number) => {
    let weeks: Week[] = []
    let week: Week = {days: []}
    weeks.push(week)
    const monthDate = new Date(year, month)
    const firstDateOfMonth = new Date(year, month, 1)
    const lastDateOfMonth = new Date(year, month+1, 0)
    
    const firstDay = getFirstDay(firstDateOfMonth)
    const lastDateOfLastMonth = getLastDateOfLastMonth(year, month)

    let dayCount = 0
    for (let i = 1; i < firstDay; i++) {
        const date = lastDateOfLastMonth - firstDay + i + 1
        const dateDate = new Date(year, month-1, date)
        week.days.push({date: dateDate, day: date, notThisMonth: true})
        dayCount += 1
    }

    const lastDate = lastDateOfMonth.getDate()
    let currentDay = 1
    while (currentDay <= lastDate) {
        dayCount += 1
        const currentDate = new Date(year, month, currentDay)
        week.days.push({date: currentDate, day: currentDay, notThisMonth: false})
        currentDay += 1
        if (dayCount % 7 === 0 && currentDay <= lastDate) {
            const newWeek: Week = {days: []}
            weeks.push(newWeek)
            week = newWeek
        }
    }

    const lastDay = getLastDay(lastDateOfMonth)
    const remaining = 7 - lastDay;
    
    for (let i = 1; i <= remaining; i++) {
        const nowDate = new Date(year, month+1, i)
        week.days.push({date: nowDate, day: i, notThisMonth: true})
    }
    return weeks
}
const getFirstDay = (firstDateOfMonth: Date) => {
    const day = firstDateOfMonth.getDay()
    return day === 0 ? 7 : day
}
const getLastDay = (lastDateOfMonth: Date) => {
    const day = lastDateOfMonth.getDay()
    return day === 0 ? 7 : day
}
const getLastDateOfLastMonth = (year: number, month: number) => {
    const d = new Date(year, month, 0)
    return d.getDate()
}