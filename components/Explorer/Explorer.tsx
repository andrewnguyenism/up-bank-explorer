import { useState } from 'react'

import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  sub,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  isSameDay,
  format,
} from 'date-fns'
import { ResponsivePie } from '@nivo/pie'

import useAccounts, { UpAccountTypeEnum } from '@/hooks/useAccounts'
import useCategories from '@/hooks/useCategories'
import useTransactions, { UpTransactionResource } from '@/hooks/useTransactions'
import { ResponsiveBar } from '@nivo/bar'

interface Props {
  token: string
}

export const Explorer = ({ token }: Props) => {
  const { categories } = useCategories(token)
  const categoriesObject: Record<string, string> = categories
    ? categories.data.reduce(
        (accumulator, category) => ({
          ...accumulator,
          [category.id]: category.attributes.name,
        }),
        {} as Record<string, string>
      )
    : {}

  const { accounts, isLoading: isLoadingAccounts } = useAccounts(token)
  const transactionAccount = accounts?.data.find(
    (account) =>
      account.attributes.accountType === UpAccountTypeEnum.TRANSACTIONAL
  )

  const [timeFilter, setTimeFilter] = useState('today')
  let since = new Date()
  let until = new Date(since.getTime())
  since = startOfDay(since)
  until = endOfDay(until)

  switch (timeFilter) {
    case 'this-week': {
      since = startOfWeek(since)
      until = endOfWeek(until)
      break
    }
    case 'last-week': {
      since = startOfWeek(sub(since, { weeks: 1 }))
      until = endOfWeek(sub(until, { weeks: 1 }))
      break
    }
    case 'this-month': {
      since = startOfMonth(since)
      until = endOfMonth(until)
      break
    }
    case 'last-month': {
      since = startOfMonth(sub(since, { months: 1 }))
      until = endOfMonth(sub(until, { months: 1 }))
      break
    }
    case 'this-year': {
      since = startOfYear(since)
      until = endOfYear(until)
      break
    }
    case 'last-year': {
      since = startOfYear(sub(since, { years: 1 }))
      until = endOfYear(sub(until, { years: 1 }))
      break
    }
  }

  const {
    allTransactions,
    isLoading: isLoadingAllTransactions,
  } = useTransactions(token, {
    all: true,
    account: transactionAccount?.id,
    filter: {
      since: timeFilter !== 'all-time' ? since.toISOString() : undefined,
      until: timeFilter !== 'all-time' ? until.toISOString() : undefined,
    },
  })

  const allTransactionsArray = allTransactions
    ? allTransactions
        .flat()
        .reduce(
          (accumulator, response) => [...accumulator, ...response.data],
          [] as Array<UpTransactionResource>
        )
        .filter(
          (transaction) =>
            transaction.attributes.amount.valueInBaseUnits < 0 &&
            transaction.relationships.category.data !== null
        )
    : []

  const spendByDayOrMonth = allTransactionsArray.reduce(
    (pageSummary, transaction) => {
      const date = new Date(transaction.attributes.createdAt)
      const dateNoTime = date.toLocaleDateString()
      const justTheMonthAndYear = format(date, 'MMM yyyy')
      let whichDateCategoryToUse = dateNoTime
      if (timeFilter === 'all-time' || timeFilter.includes('year')) {
        whichDateCategoryToUse = justTheMonthAndYear
      }
      return {
        ...pageSummary,
        [whichDateCategoryToUse]:
          (pageSummary?.[whichDateCategoryToUse] ?? 0) +
          Math.abs(transaction.attributes.amount.valueInBaseUnits / 100),
      }
    },
    {} as Record<string, number>
  )

  const barChartData = spendByDayOrMonth
    ? Object.entries(spendByDayOrMonth)
        .map(([date, amount]) => ({
          amount,
          date,
        }))
        .sort()
    : []

  const spendSummaryByCategory = allTransactionsArray.reduce(
    (pageSummary, transaction) => {
      if (transaction.relationships.category.data) {
        if (transaction.attributes.amount.valueInBaseUnits < 0) {
          return {
            ...pageSummary,
            [transaction.relationships.category.data.id]:
              (pageSummary?.[transaction.relationships.category.data.id] ?? 0) +
              Math.abs(transaction.attributes.amount.valueInBaseUnits / 100),
          }
        } else {
          return pageSummary
        }
      } else {
        return pageSummary
      }
    },
    {} as Record<string, number>
  )

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  )

  const pieChartData = spendSummaryByCategory
    ? Object.entries(spendSummaryByCategory)
        .map(([categoryId, amount]) => ({
          amount: amount,
          categoryId: categoryId,
          categoryName: categoriesObject[categoryId],
        }))
        .sort((a, b) => a.amount - b.amount)
    : []

  const totalSpend = spendSummaryByCategory
    ? Object.entries(spendSummaryByCategory).reduce(
        (total, [, amount]) => total + amount,
        0
      )
    : 0

  const valueFormatter = (value: number | string) =>
    `$${value.toLocaleString('en-AU', {
      minimumFractionDigits: 2,
    })}`

  let dataDateText = `data between ${format(since, 'dd/MM/yyyy')} and ${format(
    until,
    'dd/MM/yyyy'
  )}`
  if (isSameDay(since, until)) {
    dataDateText = `data for ${format(since, 'dd/MM/yyyy')}`
  }
  if (timeFilter === 'all-time') {
    dataDateText = `data since the beginning of (your) time (with Up)`
  }

  return (
    <div className="mx-4">
      <section className="my-4">
        <div className="text-2xl uppercase font-semibold mb-4">
          Accounts Snapshot
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          {!accounts && isLoadingAccounts ? (
            <>
              <div className="rounded border-2 p-4">
                <div className="h-6 w-20 mb-2 animate-pulse bg-gray-200" />
                <div className="h-8 w-32 animate-pulse bg-gray-200" />
              </div>
              <div className="rounded border-2 p-4">
                <div className="h-6 w-20 mb-2 animate-pulse bg-gray-200" />
                <div className="h-8 w-32 animate-pulse bg-gray-200" />
              </div>
              <div className="rounded border-2 p-4">
                <div className="h-6 w-20 mb-2 animate-pulse bg-gray-200" />
                <div className="h-8 w-32 animate-pulse bg-gray-200" />
              </div>
            </>
          ) : (
            accounts?.data.map((account) => (
              <div className="rounded border-2 p-4" key={account.id}>
                <div className="text-lg">{account.attributes.displayName}</div>
                <div className="text-3xl font-semibold">{`$${(
                  account.attributes.balance.valueInBaseUnits / 100
                ).toLocaleString('en-AU', {
                  minimumFractionDigits: 2,
                })}`}</div>
              </div>
            ))
          )}
        </div>
      </section>
      <section className="my-4">
        <div className="text-2xl uppercase font-semibold mb-4">Spending</div>
        <div className="">Quick Filters</div>
        <div className="flex flex-wrap mb-4 mt-2">
          <button
            className={`border-2 px-4 py-1 mr-4 uppercase text-sm${
              timeFilter === 'today' ? ' bg-gray-200' : ''
            }`}
            onClick={() => setTimeFilter('today')}
          >
            Today
          </button>
          <button
            className={`border-2 px-4 py-1 mr-4 uppercase text-sm${
              timeFilter === 'this-week' ? ' bg-gray-200' : ''
            }`}
            onClick={() => setTimeFilter('this-week')}
          >
            This Week
          </button>
          <button
            className={`border-2 px-4 py-1 mr-4 uppercase text-sm${
              timeFilter === 'last-week' ? ' bg-gray-200' : ''
            }`}
            onClick={() => setTimeFilter('last-week')}
          >
            Last Week
          </button>
          <button
            className={`border-2 px-4 py-1 mr-4 uppercase text-sm${
              timeFilter === 'this-month' ? ' bg-gray-200' : ''
            }`}
            onClick={() => setTimeFilter('this-month')}
          >
            This Month
          </button>
          <button
            className={`border-2 px-4 py-1 mr-4 uppercase text-sm${
              timeFilter === 'last-month' ? ' bg-gray-200' : ''
            }`}
            onClick={() => setTimeFilter('last-month')}
          >
            Last Month
          </button>
          <button
            className={`border-2 px-4 py-1 mr-4 uppercase text-sm${
              timeFilter === 'this-year' ? ' bg-gray-200' : ''
            }`}
            onClick={() => setTimeFilter('this-year')}
          >
            This Year
          </button>
          <button
            className={`border-2 px-4 py-1 mr-4 uppercase text-sm${
              timeFilter === 'last-year' ? ' bg-gray-200' : ''
            }`}
            onClick={() => setTimeFilter('last-year')}
          >
            Last Year
          </button>
          <button
            className={`border-2 px-4 py-1 uppercase text-sm${
              timeFilter === 'all-time' ? ' bg-gray-200' : ''
            }`}
            onClick={() => setTimeFilter('all-time')}
          >
            All Time
          </button>
        </div>
        {isLoadingAllTransactions && (
          <div className="text-xl font-extralight">
            Loading {dataDateText}...
          </div>
        )}
        {!isLoadingAllTransactions && categories && spendSummaryByCategory && (
          <section>
            <div>Viewing {dataDateText}</div>
            <div className="text-xl text-center">
              Total Spend
              <div className="text-2xl font-bold">
                $
                {totalSpend.toLocaleString('en-AU', {
                  minimumFractionDigits: 2,
                })}
              </div>
            </div>
            <div className="text-xl uppercase my-4">Over Time</div>
            <div className="mx-4" style={{ height: '48rem' }}>
              <ResponsiveBar
                colors={{ scheme: 'pastel2' }}
                data={barChartData}
                indexBy="date"
                keys={['amount']}
                labelFormat={valueFormatter}
                margin={{ bottom: 50, top: 50 }}
                tooltipFormat={valueFormatter}
              />
            </div>
            <div className="text-xl uppercase mt-4">By Category</div>
            {selectedCategoryId && (
              <>
                <div>
                  Spend in{' '}
                  <span className="italic">
                    {categoriesObject[selectedCategoryId]}
                  </span>
                  :{' '}
                  <span className="font-bold">
                    {valueFormatter(spendSummaryByCategory[selectedCategoryId])}
                  </span>
                </div>
                <button
                  className="text-sm underline"
                  onClick={() => setSelectedCategoryId(null)}
                >
                  Clear Category
                </button>
              </>
            )}
            <div className="mx-4" style={{ height: '48rem' }}>
              <ResponsivePie
                colors={{ scheme: 'pastel2' }}
                data={pieChartData.filter(
                  (datum) =>
                    !selectedCategoryId ||
                    datum.categoryId === selectedCategoryId
                )}
                id="categoryName"
                margin={{ bottom: 50, top: 50 }}
                onClick={(datum) =>
                  setSelectedCategoryId(datum.data.categoryId)
                }
                radialLabelsSkipAngle={5}
                sliceLabelsSkipAngle={15}
                value="amount"
                valueFormat={valueFormatter}
              />
            </div>
            <section className="my-4">
              <div className="text-xl uppercase my-4">Transactions</div>
              <div>
                {allTransactionsArray
                  .filter(
                    (transaction) =>
                      !selectedCategoryId ||
                      selectedCategoryId ===
                        transaction.relationships.category.data?.id
                  )
                  .sort((a, b) => {
                    if (a.attributes.createdAt === b.attributes.createdAt) {
                      return 0
                    } else if (
                      a.attributes.createdAt < b.attributes.createdAt
                    ) {
                      return -1
                    } else {
                      return 1
                    }
                  })
                  .map((transaction) => (
                    <div
                      className="flex p-4 border-2 justify-between items-center"
                      key={transaction.id}
                    >
                      <div>
                        <div>
                          {new Date(
                            transaction.attributes.createdAt
                          ).toLocaleString('en-AU')}
                        </div>
                        <div>{transaction.attributes.description}</div>
                        {transaction.relationships.category.data !== null && (
                          <div className="text-sm italic">
                            {
                              categoriesObject[
                                transaction.relationships.category.data.id
                              ]
                            }
                          </div>
                        )}
                      </div>
                      <div className="text-lg font-semibold">
                        $
                        {Math.abs(
                          transaction.attributes.amount.valueInBaseUnits / 100
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </section>
          </section>
        )}
      </section>
    </div>
  )
}
