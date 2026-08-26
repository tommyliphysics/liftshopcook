import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { collection, onSnapshot } from 'firebase/firestore'
import { auth, db } from '../firebase.ts'
import BackButton from '../components/BackButton.tsx'
import Modal from '../components/Modal.tsx'
import ReportModal from '../components/ReportModal.tsx'
import PeriodReportSection from '../components/PeriodReportSection.tsx'
import Icon from '../components/Icon.tsx'
import { computeReport, type ReportData } from '../lib/report.ts'
import type { ExchangeRateRecord } from '../lib/currencyResolution.ts'
import {
  addDays,
  buildDateRange,
  capitalize,
  formatDayHeading,
  formatDayMonth,
  formatMonthYear,
  formatYear,
  monthRange,
  parseDateStr,
  toDateStr,
  weekRange,
  yearRange,
} from '../lib/timeline.ts'
import type { MealListItem, MealTime } from '../types/food.ts'
import './pages.css'

const FUTURE_DAYS = 365

const TIME_ORDER: Record<MealTime, number> = {
  breakfast: 0,
  lunch: 1,
  dinner: 2,
  snack: 3,
  drink: 4,
  '': 5,
}

function CalendarPage() {
  const [meals, setMeals] = useState<MealListItem[]>([])
  const [jumpOpen, setJumpOpen] = useState(false)
  const [jumpDate, setJumpDate] = useState('')
  const [reportOpen, setReportOpen] = useState(false)
  const [reportTitle, setReportTitle] = useState('')
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [reportMeals, setReportMeals] = useState<MealListItem[]>([])
  const [reportRange, setReportRange] = useState<[string, string]>(['', ''])
  const [exchangeRates, setExchangeRates] = useState<ExchangeRateRecord[]>([])
  const [expandedWeekStart, setExpandedWeekStart] = useState<string | null>(null)
  const [expandedDay, setExpandedDay] = useState<string | null>(null)
  const [expandedMealRecipes, setExpandedMealRecipes] = useState<Set<string>>(
    new Set(),
  )

  useEffect(() => {
    const user = auth.currentUser
    if (!user) return

    return onSnapshot(collection(db, 'users', user.uid, 'meals'), (snapshot) => {
      setMeals(
        snapshot.docs.map(
          (docSnapshot) =>
            ({ id: docSnapshot.id, ...docSnapshot.data() }) as MealListItem,
        ),
      )
    })
  }, [])

  useEffect(() => {
    const user = auth.currentUser
    if (!user) return

    return onSnapshot(
      collection(db, 'users', user.uid, 'exchangeRates'),
      (snapshot) => {
        setExchangeRates(
          snapshot.docs.map((docSnapshot) => docSnapshot.data() as ExchangeRateRecord),
        )
      },
    )
  }, [])

  const todayStr = toDateStr(new Date())
  const creationDateStr = useMemo(() => {
    const creationTime = auth.currentUser?.metadata.creationTime
    return creationTime ? toDateStr(new Date(creationTime)) : todayStr
  }, [todayStr])

  const futureEndStr = useMemo(
    () => addDays(todayStr, FUTURE_DAYS),
    [todayStr],
  )

  const timelineDates = useMemo(
    () => buildDateRange(creationDateStr, futureEndStr),
    [creationDateStr, futureEndStr],
  )

  const mealsByDate = useMemo(() => {
    const groups: Record<string, MealListItem[]> = {}
    for (const meal of meals) {
      const group = (groups[meal.date] ??= [])
      group.push(meal)
    }
    for (const dayMeals of Object.values(groups)) {
      dayMeals.sort((a, b) => TIME_ORDER[a.time] - TIME_ORDER[b.time])
    }
    return groups
  }, [meals])

  function scrollToToday(behavior: ScrollBehavior = 'smooth') {
    const el = document.getElementById(`day-${todayStr}`)
    el?.scrollIntoView({ behavior, block: 'start' })
  }

  useEffect(() => {
    scrollToToday('instant')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleJumpDateChange(value: string) {
    setJumpDate(value)
    const el = document.getElementById(`day-${value}`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    setJumpOpen(false)
  }

  function getRangeMealsAndDays(start: string, end: string) {
    const qualifyingDates = timelineDates.filter(
      (d) => d >= start && d <= end,
    )
    const qualifyingDateSet = new Set(qualifyingDates)
    const rangeMeals = meals.filter((meal) => qualifyingDateSet.has(meal.date))
    return { rangeMeals, days: qualifyingDates.length }
  }

  function openReport(title: string, [start, end]: [string, string]) {
    const { rangeMeals, days } = getRangeMealsAndDays(start, end)

    setReportTitle(title)
    setReportData(computeReport(rangeMeals, days))
    setReportMeals(rangeMeals)
    setReportRange([start, end])
    setReportOpen(true)
  }

  function toggleWeek(start: string) {
    setExpandedWeekStart((current) => (current === start ? null : start))
  }

  function toggleDay(dateStr: string) {
    setExpandedDay((current) => (current === dateStr ? null : dateStr))
  }

  function toggleMealRecipe(e: React.MouseEvent, key: string) {
    e.preventDefault()
    e.stopPropagation()
    setExpandedMealRecipes((current) => {
      const next = new Set(current)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  return (
    <section className="page page-calendar">
      <div className="calendar-header-row">
        <h1>Calendar</h1>
        <button
          type="button"
          className="icon-btn"
          onClick={() => scrollToToday()}
          aria-label="Scroll to today"
        >
          <Icon name="target" size={17} />
        </button>
        <button
          type="button"
          className="icon-btn"
          onClick={() => setJumpOpen(true)}
          aria-label="Jump to date"
        >
          <Icon name="calendar" size={17} />
        </button>
      </div>

      <div className="calendar-scroll">
        <div className="timeline">
          {timelineDates.map((dateStr) => {
          const date = parseDateStr(dateStr)
          const isSunday = date.getDay() === 0
          const isFirstOfMonth = date.getDate() === 1
          const isJan1 = isFirstOfMonth && date.getMonth() === 0
          const dayMeals = mealsByDate[dateStr] ?? []
          const isToday = dateStr === todayStr

          return (
            <div key={dateStr}>
              {isJan1 && (
                <button
                  type="button"
                  className="timeline-header timeline-header--year"
                  onClick={() => openReport(formatYear(dateStr), yearRange(dateStr))}
                >
                  {formatYear(dateStr)}
                </button>
              )}
              {isFirstOfMonth && (
                <button
                  type="button"
                  className="timeline-header timeline-header--month"
                  onClick={() =>
                    openReport(formatMonthYear(dateStr), monthRange(dateStr))
                  }
                >
                  {formatMonthYear(dateStr)}
                </button>
              )}
              {isSunday &&
                (() => {
                  const [start, end] = weekRange(dateStr)
                  const label = `${formatDayMonth(start)} - ${formatDayMonth(end)}`
                  const expanded = expandedWeekStart === start
                  return (
                    <>
                      <button
                        type="button"
                        className="timeline-header timeline-header--week"
                        onClick={() => toggleWeek(start)}
                        aria-expanded={expanded}
                      >
                        {label}
                        <Icon name="chevron-down" size={15} />
                      </button>
                      {expanded &&
                        (() => {
                          const { rangeMeals, days } = getRangeMealsAndDays(
                            start,
                            end,
                          )
                          return (
                            <PeriodReportSection
                              key={start}
                              variant="week"
                              meals={rangeMeals}
                              days={days}
                              range={[start, end]}
                              exchangeRates={exchangeRates}
                            />
                          )
                        })()}
                    </>
                  )
                })()}

              <div className="timeline-day" id={`day-${dateStr}`}>
                <button
                  type="button"
                  className={`timeline-date-link${isToday ? ' timeline-date-link--today' : ''}`}
                  onClick={() => toggleDay(dateStr)}
                  aria-expanded={expandedDay === dateStr}
                >
                  {formatDayHeading(dateStr)}
                  {isToday && <span className="meal-time-tag">Today</span>}
                  <Icon name="chevron-down" size={14} />
                </button>

                {expandedDay === dateStr && (
                  <PeriodReportSection
                    variant="day"
                    meals={dayMeals}
                    days={1}
                    range={[dateStr, dateStr]}
                    exchangeRates={exchangeRates}
                  />
                )}

                {dayMeals.map((meal) => (
                  <Link
                    className="meal-card"
                    to={`/meals/${meal.id}/edit`}
                    key={meal.id}
                  >
                    {(meal.name || meal.time) && (
                      <div className="meal-card-header">
                        {meal.name && <span>{meal.name}</span>}
                        {meal.time && (
                          <span className="meal-time-tag">
                            {capitalize(meal.time)}
                          </span>
                        )}
                      </div>
                    )}
                    <ul>
                      {(
                        meal.entries ??
                        Object.values(meal.foods ?? {}).map((food) => ({
                          kind: 'food' as const,
                          foodId: '',
                          name: food.name,
                        }))
                      ).map((entry, i) => {
                        if (entry.kind === 'recipe') {
                          const key = `${meal.id}-${i}`
                          const expanded = expandedMealRecipes.has(key)
                          return (
                            <li key={i}>
                              <button
                                type="button"
                                className="meal-entry-recipe"
                                aria-expanded={expanded}
                                onClick={(e) => toggleMealRecipe(e, key)}
                              >
                                <Icon name="book" size={12} />
                                {entry.name}
                                <Icon name="chevron-down" size={12} />
                              </button>
                              {expanded && (
                                <ul className="meal-entry-subitems">
                                  {entry.foods.map((food, j) => (
                                    <li key={j}>{food.name}</li>
                                  ))}
                                </ul>
                              )}
                            </li>
                          )
                        }
                        return <li key={i}>{entry.name}</li>
                      })}
                    </ul>
                  </Link>
                ))}

                <Link
                  to={`/plan-meal?date=${dateStr}`}
                  className="btn btn-secondary btn-full"
                >
                  <Icon name="plus" size={16} />
                  Add meal
                </Link>
              </div>
            </div>
          )
        })}
        </div>
      </div>

      <div className="calendar-footer">
        <BackButton />
      </div>

      <Modal
        open={jumpOpen}
        onClose={() => setJumpOpen(false)}
        titleId="jump-title"
        title="Jump to Date"
      >
        <label htmlFor="jump-date">Date</label>
        <input
          id="jump-date"
          type="date"
          min={creationDateStr}
          max={futureEndStr}
          value={jumpDate}
          onChange={(e) => handleJumpDateChange(e.target.value)}
        />
      </Modal>

      <ReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        title={reportTitle}
        report={reportData}
        meals={reportMeals}
        range={reportRange}
        exchangeRates={exchangeRates}
      />
    </section>
  )
}

export default CalendarPage
