---
layout: post
title: Simple calendar component for React
date: 2018-10-05
tags:
    - React
aliases: ["/2018/10/05/react-simple-calendar-component.html"]
---

First here is the repository on [github](https://github.com/po8rewq/react-simple-calendar) and the [demo page](https://po8rewq.github.io/react-simple-calendar/).

## Why a new component?

Quite simple answer, I needed a calendar that could be customized easily for multiple small projects.

This component handles the display of the calendar, and you can give it a custom element for the cells and/or the title (meaning name of the days). You could also don't use this custom component and just display the date (for a date picker for example - see below).

The main callback is `onDateSelected` which will be called - as you would guess - when a cell has been clicked with the date as parameter, so you can do anything, like displaying a modal to create lets say an event.

More information on the [documentation](https://github.com/po8rewq/react-simple-calendar).

## Quick demo

{{< highlight javascript >}}
function DatePicker() {
  var date = new Date('08/05/2018');
  return (
    <div>
      <div>
        {/* you could add buttons to navigate between months */}
        <h1>August</h1>
      </div>
      <Calendar
        className="minimal-calendar"
        currentMonth={date}
        onDateSelected={date => console.log(date)}
        cellContainerStyle={{
          textAlign: 'center',
          cursor: 'pointer'
        }}
        showMonthName={false}
        titleComponent={CustomTitleCell}
      />
    </div>
  );
}
{{< /highlight >}}
