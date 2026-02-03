/*
 * Copyright (C) 2013-2024 David Charlap
 *
 * This program is free software: you can redistribute it and/or modify it
 * under the terms of the GNU General Public License as published by the Free
 * Software Foundation, either version 3 of the License, or (at your option)
 * any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for
 * more details.
 *
 * You should have received a copy of the GNU General Public License along with
 * this program. If not, see <https://www.gnu.org/licenses/>.
 */

/*
 * Background colors dates.  These must match the color in the CSS file, for
 * best results.  Whenever a date is using less than 100% time, these values
 * are used to compute the lighter shade of the color.  Otherwise the CSS style
 * is used.
 *
 * Note that these must be in RGB form, since the code to lighten them is
 * parsing that.
 */
var background_colors = {
    workday     : "#FFFFFF",   // White
    weekend     : "#FF0000",   // Red

    bereavement : "#AAAAFF",
    floating    : "#FF9999",
    holiday     : "#FF0000",
    personal    : "#00FFFF",
    sick        : "#FFFF00",
    unofficial  : "#3F3FFF",
    vacation    : "#00FF00",
    volunteer   : "#00CCCC"
};

/*
 * Call the toFixed method, but then strip trailing zeros and, if
 * one remains, any trailing decimal point.
 *
 * Is there a built-in JS function for this?  It seems like one
 * should exist somewhere...
 */
function toFixedStripZeros(number, places)
{
    var str = number.toFixed(places);

    // Degenerate case - if there's no decimal point, stop now and
    // return what we've got
    if (str.search(".") < 0)
    {
        return str;
    }

    var lastchar = str.length-1;

    while (str.charAt(lastchar) == '0')
        lastchar--;

    if (str.charAt(lastchar) == '.')
        lastchar--;

    return str.slice(0, lastchar+1);
}

/*
 * Generate the days/hours output used when printing various summaries
 *
 * description - The name of the category
 * days - The number of days (to be rendered both as days and hours)
 * places - The number of decimal places for output
 * max - The maximum number of days before we render the count in red
 *       (negative values are always red).  Undefined means no max.
 */
function generateDaysHours(description, days, places, max)
{
    document.write("    " + description + ": ");
    if ((days < 0) || ((typeof max !== 'undefined') && (days > max)))
    {
        document.write("<SPAN CLASS='alert'>");
    }
    document.write(toFixedStripZeros(days, places));
    if ((days < 0) || ((typeof max !== 'undefined') && (days > max)))
    {
        document.write("</SPAN>");
    }
    if (days == 1)
    {
	document.write(" day (");
    }
    else
    {
	document.write(" days (");
    }
    if ((days < 0) || ((typeof max !== 'undefined') && (days > max)))
    {
        document.write("<SPAN CLASS='alert'>");
    }
    document.write(toFixedStripZeros(days * 8, places));
    if ((days < 0) || ((typeof max !== 'undefined') && (days > max)))
    {
        document.write("</SPAN>");
    }
    if ((days * 8) == 1)
    {
	document.write(" hour)");
    }
    else
    {
	document.write(" hours)");
    }
}

// For generating the carryover string used in the legend
//
function generate_carryin_text(carryin, annual, places)
{
    if (carryin.toFixed(places) == 0)
    {
        return " days";
    }

    var str = "";

    if (carryin < 0)
    {
        str = " - " + toFixedStripZeros(-carryin, places);
    }
    else
    {
        str = " + " + toFixedStripZeros(carryin, places);
    }

    return str + " days carryover = " + toFixedStripZeros(carryin + annual, places);
}

// Generate a warning if we're carrying too many days to/from the
// previous year
//
function generate_carryin_warning(description, carryin, limit, places)
{
    if (typeof limit === 'undefined')
    {
        return
    }
    if (carryin < 0)
    {
        // Days borrowed by the prior year
        if ((-carryin) > limit)
        {
            document.write("<B>WARNING:</B> " +
                           toFixedStripZeros(-carryin, places) +
                           " days " +
                           description +
                           " have been borrowed from the previous year.  " +
                           "<B>This is " +
                           toFixedStripZeros((-carryin) - limit, places) +
                           " days over the " +
                           toFixedStripZeros(limit, places) +
                           " day limit</B><BR />\n");
        }
    }
    else
    {
        // Days carried over from the prior year
        if (carryin > limit)
        {
            document.write("<B>WARNING:</B> " +
                           toFixedStripZeros(carryin, places) +
                           " days " +
                           description +
                           " have been carried over from the previous year. " +
                           "<B>This is " +
                           toFixedStripZeros(carryin - limit, places) +
                           " days over the " +
                           toFixedStripZeros(limit, places) +
                           " day limit</B><BR />\n");
        }
    }
}

// Generate a warning if we're carrying too many days to/from the
// next year
//
function generate_carryout_warning(description, carryout, limit, places)
{
    if (carryout < 0)
    {
        // Days borrowed from the next year
        if ((-carryout) > limit)
        {
            document.write("<B>WARNING:</B> " +
                           toFixedStripZeros(-carryout, places) +
                           " days " +
                           description +
                           " have been borrowed from the next year.  " +
                           "<B>This is " +
                           toFixedStripZeros((-carryout) - limit, places) +
                           " days over the " +
                           toFixedStripZeros(limit, places) +
                           " day limit</B><BR />\n");
        }
    }
    else
    {
        // Days carried over to the next year
        if (carryout > limit)
        {
            document.write("<B>WARNING:</B> " +
                           toFixedStripZeros(carryout, places) +
                           " days " +
                           description +
                           " have been carried over to the next year.  " +
                           "<B>This is " +
                           toFixedStripZeros(carryout - limit, places) +
                           " days over the " +
                           toFixedStripZeros(limit, places) +
                           " day limit</B><BR />\n");
        }
    }
}

// How many days are in a month?
//
function days_in_month(month, year)
{
    // Date(year,month,0) returns a date object corresponding to the last day
    // of month-1.  That date is the number of days in month-1.
    //
    // Since the month input is in the range 1..12 and JavaScript expects
    // 0..11, we can just pass month in, which will do what we want (request
    // day-0 of month+1, yielding the last day of month)
    //
    return new Date(year, month, 0).getDate();
}

// What day of the week is the first of each month.
//
function day1_of_month(month, year)
{
    return new Date(year, month-1).getDay();
}

/*
 * When there's a PTO consisting of less than 1 day, lighten its
 * color in proportion.  The less time off for a day, the closer
 * to white the color should be.
 */
function lighten_color(color, days)
{
    // No adjustment for full-days.  Larger than 1 day is treated as
    // 1 day.
    if (days >= 1)
        return "";

    // No adjustment for negative days.  These are corrections for
    // the counts and really don't reflect reality
    if (days < 0)
        return "";

    /* Split the color string into R, G and B
     *
     * Originally, I thought I could just operate on the raw 24-bit
     * number representing the entire color, but that's bad because
     * when dividing values, remainders will borrow from other color
     * components, which we definitely don't want.  We want
     * fractions to be truncated or rounded within a single
     * component.
     */
    var f = parseInt(color.slice(1),16);
    var R = (f & 0xFF0000) >> 16;
    var G = (f & 0x00FF00) >> 8;
    var B = (f & 0x0000FF);

    /* Lighten the colors.
     *
     * Here's the algorithm -
     *   - Compute the gap beween 255 (full saturation) and the
     *     requested color
     *   - Reduce the gap by the amount of time not on PTO
     *   - Compute the new component based on the new gap
     *
     * Long-form, code for each component looks like:
     *    var gap = 255 - component;
     *    gap *= days;
     *    component = Math.round(255 - gap);
     */
    R = Math.round(255 - ((255 - R) * days));
    G = Math.round(255 - ((255 - G) * days));
    B = Math.round(255 - ((255 - B) * days));

    /*
     * Combine the new R, G and B into a color string and return it.
     * The addition of 0x1000000 is to make sure we have leading
     * zeros where necessary.  We'll strip off that character after
     * we make the string
     */
    f = 0x1000000 + ((R & 0xFF) << 16) + ((G & 0xFF) << 8) | (B & 0xFF);
    return "#" + f.toString(16).slice(1);
}

/*
 * Fetch the color corresponding to a particular date
 *
 * The output is an array containing a CSS style and a color.  The color is the
 * empty string if no lightening takes place.
 */
function get_color(day_of_week, pto)
{
    /*
     * Working on a weekend is a special case that must come before
     * the weekend checks (obviously)
     */
    if (pto && (pto.type == "w"))
        return ["workday", ""];

    // Weekends
    if ((day_of_week == 0) || (day_of_week == 6))
        return ["weekend", ""];

    // A weekday is white (normal working day) unless some other
    // event takes precedence
    var style = "workday";
    var color = background_colors.workday;  // Working weekday

    if (pto)
    {
        switch(pto.type)
        {
          case "b": // Bereavement
            style = "bereavement";
            color = background_colors.bereavement;
            break;
          case "f": // Floating holiday
            style = "floating";
            color = background_colors.floating;
            break;
          case "h": // Holiday - Company closed
            style = "holiday";
            color = background_colors.holiday;
            break;
          case "p": // Personal business
            style = "personal";
            color = background_colors.personal;
            break;
          case "s": // Sick
            style = "sick";
            color = background_colors.sick;
            break;
          case "u": // Unofficial/unpaid time off
            style = "unofficial";
            color = background_colors.unofficial;
            break;
          case "v": // Vacation
            style = "vacation";
            color = background_colors.vacation;
            break;
          case "vo": // Volunteer leave
            style = "volunteer"
            color = background_colors.volunteer;
            break;
        }

        color = lighten_color(color, pto.days);
    }

    return [style, color];
}

/*
 * Get the PTO description for a date
 */
function get_description(pto)
{
    if (pto)
    {
        if (pto.days >= 1)
        {
            return pto.description;
        }

        var hours = pto.days * 8;

        return pto.description + " (" + hours + " hours PTO)";
    }
    else
    {
        return "";
    }
}

/*
 * Decrement the PTO counts for a date
 */
function decrement_pto_remaining(pto_remaining, pto)
{
    if (pto)
    {
        switch(pto.type)
        {
          case "f":
            pto_remaining.floating -= pto.days;
            break;
          case "p":
            pto_remaining.personal -= pto.days;
            break;
          case "s":
            pto_remaining.sick -= pto.days;
            break;
          case "u":
            pto_remaining.unofficial += pto.days;
            break;
          case "v":
            pto_remaining.vacation -= pto.days;
            break;
          case "vo":
            pto_remaining.volunteer -= pto.days;
            break;
        }
    }
}

/*
 * Generate the month-header (first line of each month) for the
 * output
 */
function generate_month_header()
{
    document.write("    <TR>\n");
    document.write("      <TH>S</TH>\n");
    document.write("      <TH>M</TH>\n");
    document.write("      <TH>T</TH>\n");
    document.write("      <TH>W</TH>\n");
    document.write("      <TH>R</TH>\n");
    document.write("      <TH>F</TH>\n");
    document.write("      <TH>S</TH>\n");
    document.write("    </TR>");
}

/*
 * Generate a month output.  This is an HTML table (which is, in
 * turn, nested within other tables)
 */
function generate_month(month, year, pto_remaining, pto_database, places)
{
    // If PTO is accruing, increment the month's count before we
    // start
    //
    pto_remaining.sick += (pto_remaining.sick_accrual *
                           pto_remaining.num_checks[month-1]);
    pto_remaining.vacation += (pto_remaining.vacation_accrual *
                               pto_remaining.num_checks[month-1]);

    // Generate the localized month name.  Note that JavaScript months are
    // 0..11, not 1..12
    //
    name = new Intl.DateTimeFormat(
        navigator.language, { month: 'long'}).format(new Date(year, month-1));

    // A month is a table item (TD) that contains a table
    //
    document.write("  <TD>\n");
    document.write("    <TABLE BORDER=1 CELLSPACING=0 CLASS='month'>\n");

    // The caption is the month's name
    document.write("    <CAPTION><B>" + name + "</B></CAPTION>\n");

    // Generate the header line (week-day names)
    generate_month_header();

    var days_left = days_in_month(month, year);
    var day_of_week = day1_of_month(month, year);
    var day = 1;

    // Generate the rows containing the dates
    document.write("<TR>\n");

    // The first line will have a gap-cell to align day-1 with the
    // appropriate day of the week
    //
    if (day_of_week > 0)
        document.write("      <TD COLSPAN=" + day_of_week + "></TD>\n");

    // Now generate the dates
    //
    while (days_left > 0)
    {
        // If the last date was a Saturday, start a new table-row and
        // wrap to Sunday
        //
        if (day_of_week == 7)
        {
            document.write("    </TR><TR>\n");
            day_of_week = 0;
        }

        // Generate a date.  First look up any possible PTO and get
        // the appropriate background color for that date
        //
        var key = month + "/" + day;
        var pto = pto_database[key];

        var colorstyle = get_color(day_of_week, pto);

        // Each date is a table cell (TD), using the PTO-derived
        // background color
        //
        document.write("      <TD CLASS='" + colorstyle[0] + "'");
        
        if (colorstyle[1] != "")
            document.write(" STYLE='background-color:" + colorstyle[1] + ";'");
        
        if (pto)
        {
            // If there is any PTO, its decription is its tool-tip
            //
            var description = get_description(pto);
            if (description != "")
            {
                document.write(' TITLE="' + description + '"');
            }
        }

        // The cell's content is the day number.
        document.write(">" + day + "</TD>\n");

        // Adjust counts for the month
        day++;
        days_left--;
        day_of_week++;

        // If this date was PTO, decrement the appropriate counters
        decrement_pto_remaining(pto_remaining, pto);
    }
    document.write("    </TR>\n");
    document.write("    </TABLE>\n")

    // The date-grid is complete.  Now generate the per-month
    // summary of PTO remaining.  Note that zero-values cause the
    // entire line to be omitted.
    //
    var had_output = false;

    if (pto_remaining.num_checks[month-1] > 2)
    {
        document.write("    <B>" +
                       pto_remaining.num_checks[month-1] +
                       " paychecks this month</B>");
        had_output = true;
    }

    if (pto_remaining.vacation_accrual > 0)
    {
        if (had_output)
        {
            document.write("<BR />");
        }
        generateDaysHours("Vacation accrued",
                          (pto_remaining.vacation_accrual *
                           pto_remaining.num_checks[month-1]),
                          places);
        had_output = true;
    }

    if (pto_remaining.sick_accrual > 0)
    {
        if (had_output)
        {
            document.write("<BR />");
        }
        generateDaysHours("Sick leave accrued",
                          (pto_remaining.sick_accrual *
                           pto_remaining.num_checks[month-1]),
                          places);
        had_output = true;
    }

    // Sale of vacation is always applied to December
    //
    if ((pto_remaining.vacation_sold != 0) && (month == 12))
    {
        pto_remaining.vacation -= pto_remaining.vacation_sold;

        if (had_output)
        {
            document.write("<BR />\n");
        }
        generateDaysHours("Sale of vacation", pto_remaining.vacation_sold,
                          places);
        had_output = true;
    }

    // The various PTO-remaining counts.  Note that negative values
    // are in red to indicate a problem

    if (pto_remaining.vacation != 0)
    {
        if (had_output)
        {
            document.write("<BR />\n");
        }
        generateDaysHours("Vacation", pto_remaining.vacation, places,
                         pto_remaining.max_vacation_accrual);
        had_output = true;
    }

    if (pto_remaining.personal != 0)
    {
        if (had_output)
        {
            document.write("<BR />\n");
        }
        generateDaysHours("Personal days", pto_remaining.personal, places);
        had_output = true;
    }

    if (pto_remaining.floating != 0)
    {
        if (had_output)
        {
            document.write("<BR />\n");
        }
        generateDaysHours("Floating holidays", pto_remaining.floating, places);
        had_output = true;
    }

    if (pto_remaining.volunteer != 0)
    {
        if (had_output)
        {
            document.write("<BR />\n");
        }
        generateDaysHours("Volunteer days", pto_remaining.volunteer, places);
        had_output = true;
    }

    if (pto_remaining.sick != 0)
    {
        if (had_output)
        {
            document.write("<BR />\n");
        }
        generateDaysHours("Sick leave", pto_remaining.sick, places,
                         pto_remaining.max_sick_accrual);
        had_output = true;
    }
    if (had_output)
        document.write("\n");

    document.write("  </TD>\n");
}


/*
 * Create a PTO database.
 *
 * pto_database is the database.  An object that is an associative
 * array of objects.  Each element in the array is indexed by a
 * date string ("month/day").  Within each element, the following
 * fields are used:
 *
 * type - One of:
 *   b  = bereavement
 *   f  = floating holiday
 *   h  = holiday - company closed
 *   p  = personal busness
 *   s  = sick
 *   v  = vacation
 *   vo = volunteer
 *   w  = working on a weekend (sometimes used in China)
 * days - the number of days off.  Normally, this should never be
 *   greater than 1, since you can't take off more than one day in a
 *   day, but it may be a fraction, if you're only out for part of
 *   the day.  Negative numbers or values greater than 1 may be used
 *   to apply "corrections" for cases beyond the scope of this
 *   script.
 * description - this is a decription string for the date, to become
 *   a tool-tip
 *
 * pto_data is the data-source.  It is an array of arrays.  Each
 * element of the outer-array is one PTO date.  Within each of
 * these, the following fields exist:
 *   0 - month
 *   1 - day
 *   2 - type
 *   3 - days
 *   4 - description
 */
function generate_pto_database(pto_data)
{
    var pto_database = new Object();

    // Loop through all the pto data and add it all to the database
    for (var i=0; i<pto_data.length; i++)
    {
        var key = pto_data[i][0] + "/" + pto_data[i][1];

        pto_database[key] = new Object();
        pto_database[key].type = pto_data[i][2];
        pto_database[key].days = pto_data[i][3];
        pto_database[key].description = pto_data[i][4];
    }

    return pto_database;
}

/*
 * Generate the navigation links
 */
function generate_navigation_links()
{
    document.write("<DIV STYLE='float:left;'>\n");
    document.write("<A HREF='pto" + (year-1) + ".html'>" +
                   "&lt;&lt;&lt;----- Previous year</A>\n");
    document.write("</DIV><DIV STYLE='float:right;'>\n");
    document.write("<A HREF='pto" + (year+1) + ".html'>" +
                   "Next year -----&gt;&gt;&gt;</A>\n");
    document.write("</DIV><DIV STYLE='text-align:center;'>\n");
    document.write("<A HREF='pto.html'>This year</A>\n");
    document.write("</DIV>\n");
}

/*
 * THIS IS THE KEY FUNCTION THAT IS USED TO DRIVE EVERYTHING
 *
 * These are the parameters.  Unless otherwise specified, all are
 * mandatory
 *
 * company - String.  The company name.  Used when generating the
 *     legend
 * name - String.  The employee name.  Used for the header
 * year - Integer.  The year.  Used for the header and computing the
 *     calendar (days of the week, days per month, etc.)
 * pto_counts - Object.  A set of values indicating the parameters for
 *     the year's time-off counts.  Any value not specified is assumed
 *     to be 0 or false.  The supported values are:
 *
 *     Amount of time off allowed:
 *
 *     floating  - Number of days of floating holidays
 *     personal  - Number of days of personal leave
 *     sick      - Number of days sick leave
 *     vacation  - Number of days vacation time
 *     volunteer - Number of days volunteer leave
 *
 *     vacation_sold - Number of days of vacation sold (cash paid in
 *                     lieu)
 *
 *
 *     vacation_accrual
 *     sick_accrual
 *         If false, then the correspinding leave (vacation or sick)
 *         is block-granted at the start of the year.  If true, then
 *         they accrue on a per-paycheck basis.  Per-paycheck accrual
 *         is driven by the three_check_months parameter (see below)
 *
 *         Other forms of PTO (floating holidays and personal leave)
 *         are always entirely granted at the start of the year.
 *         There is presently no code in the script for them to accrue
 *         over time.
 *
 *     vacation_carryover_limit
 *     sick_carryover_limit
 *         The maximum number of days (vacation and sick) that may be
 *         carried over (or borrowed) from one year to the next.  It
 *         does not affect the numbers computed, but overages will
 *         cause warnings to be displayed.  This does not affect
 *         floating holidays and personal leave. They are forfeit at
 *         the end of the year if not used.  Leave these values
 *         undefined if there is no limit.
 *
 *     vacation_carryin
 *     sick_carryin
 *         The amount of days (vacation and sick) that are carried in
 *         from the prior year.  Negative values indate that the
 *         previous year borrowed them from this year.  If these
 *         values are beyond the range indicated by the carryover
 *         limits, a warning will be displayed
 *
 *     max_vacation_accrual
 *     max_sick_accrual
 *         The maximum amount of days that may be accrued at any time.
 *         Any month where the total amount exceeds this amount will
 *         have the total highlighted in red, as a warning that days
 *         will be lost if not used.
 *
 * pto_data - An array of arrays.  The various PTO dates and holidays
 *     used for the year.  Each row in the outer-array describes a
 *     single date and consists of the following values (by array
 *     index)
 *
 *     0 - month - Integer (1..12)
 *     1 - day   - Integer (1..31)
 *     2 - type  - String - Describes the date.  These drive
 *         the date's coloring and defines which PTO-count is affected
 *         by the PTO.  Unknown strings have no affect on day colors
 *         or PTO counts (but may still be useful for annotating a
 *         calendar cell.)  The valid strings are:
 *         "b"  - Bereavement leave
 *         "f"  - Floating holiday
 *         "h"  - Company holiday
 *         "p"  - Personal leave
 *         "s"  - Sick leave
 *         "u"  - Unofficial/unpaid (doesn't decrement totals)
 *         "v"  - Vacation
 *         "vo" - Volunteer leave
 *         "w"  - Working day.  Used when a weekend day is a
 *                work-dayworking on a weekend, which sometimes happens
 *                in China.
 *     3 - days - Number - The number of days off.  Fractions may be
 *             used when a partial day will be take off.  Negative
 *             values and values greater than 1 are valid and may be
 *             used for applying corrections" if circumstances
 *             unsupported by this script occur.
 *     4- description - String - Descriptive text.  Will also be used
 *             as a tool-tip for the corresponding calendar date.
 *
 *     This script currently does not support multiple PTO events on a
 *     single day.
 *
 * three_check_months - Array of Integer (1..12).  Each value
 *     indicates a month that has three paychecks.  Months not
 *     indicated have two paychecks.  This is used for driving the
 *     accrual algorithms.  If a month appears multiple times in this
 *     array, the script will act as if that month has additional
 *     paychecks (e.g. if 5 appears three times, then May will be
 *     treated as a month with 5 paychecks.)
 *
 * The accrual algorithm (for sick leave and vacation) is:
 *     - The total number of paychecks is computed (24, plus one for
 *       every element in the three_check_months array)
 *     - The accrual-rate for vacation and sick leave is either 0 (if
 *       the corresponding accrual flag is false) or the total count
 *       divided by the numberof paychecks (if the accrual flag is
 *       true.)
 *     - The total count of vacation and sick leave is initialized to
 *       0 (if accrual is true) or the total count of dates (if
 *       accrual is false).
 *     - For each month, the total count is incremented by the
 *       corresponding accrual rate times the number of paychecks in
 *       the month.
 */
function generate_body(company, name, year, pto_counts, pto_data,
                       three_check_months)
{
    var places = 2;  // For rounding floats

    var pto_database = generate_pto_database(pto_data);

    // Assign any undefinted pto counts to 0, so we don't need to
    // declare zeros in the input file
    //
    if (typeof pto_counts.floating === 'undefined')
        pto_counts.floating = 0;
    if (typeof pto_counts.personal === 'undefined')
        pto_counts.personal = 0;
    if (typeof pto_counts.sick === 'undefined')
        pto_counts.sick = 0;
    if (typeof pto_counts.vacation === 'undefined')
        pto_counts.vaction = 0;
    if (typeof pto_counts.volunteer === 'undefined')
        pto_counts.volunteer = 0;

    if (typeof pto_counts.sick_carryin === 'undefined')
        pto_counts.sick_carryin = 0;
    if (typeof pto_counts.vacation_carryin === 'undefined')
        pto_counts.vacation_carryin = 0;
    if (typeof pto_counts.vacation_sold === 'undefined')
        pto_counts.vacation_sold = 0;

    // This is probably unnecessary, given the usage below, but just
    // in case...
    //
    if (typeof pto_counts.vacation_accrual === 'undefined')
        pto_counts.vacation_accrual = false;
    if (typeof pto_counts.sick_accrual === 'undefined')
        pto_counts.sick_accrual = false;

    /*
     * pto_remaining tracks the amount of PTO remaining as we process
     * each month.  It also holds some other values that are related,
     * and are used to carry state from month to month as we go
     *
     * floating, personal, sick, vacation, and volunteer are all
     * counts of PTO remaining
     *
     * unofficial is a count of unofficial/unpaid days off used.
     *
     * vacation_sold is a count of days PTO that were sold
     *
     * sick_accrual and vacation_accrual are is the number of days
     * sick/ vacation that are accrued each paycheck.  Zero if
     * vacation is block-granted and doesn't accrue.
     *
     * num_checks is an array indicating how many paychecks there are
     * in each month.
     */
    var pto_remaining = {
        floating                : pto_counts.floating,
        personal                : pto_counts.personal,
        sick                    : pto_counts.sick,
        unofficial              : 0,
        vacation                : pto_counts.vacation,
        vacation_sold           : pto_counts.vacation_sold,
        volunteer               : pto_counts.volunteer,

        vacation_accrual        : 0,
        sick_accrual            : 0,
        num_checks              : [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    };

    // If PTO accrues, then it starts at 0 and increments by 1/12 of
    // the total amount each month
    //
    if (pto_counts.vacation_accrual || pto_counts.sick_accrual)
    {
        // 2 paychecks per month.  Plus 1 extra for each month in the
        // "three_check_months" array
        //
        var num_paychecks = 24;

        // If three_check_months is not provided, assume every month
        // has 2 checks.
        //
        if (typeof three_check_months !== 'undefined')
        {
            num_paychecks += three_check_months.length;
            for (var i=0; i<three_check_months.length; i++)
            {
                pto_remaining.num_checks[three_check_months[i]-1]++;
            }
        }

        if (pto_counts.vacation_accrual)
        {
            pto_remaining.vacation = 0;
            pto_remaining.vacation_accrual =
                (pto_counts.vacation / num_paychecks);
        }

        if (pto_counts.sick_accrual)
        {
            pto_remaining.sick = 0;
            pto_remaining.sick_accrual = (pto_counts.sick / num_paychecks);
        }

        pto_remaining.max_vacation_accrual = pto_counts.max_vacation_accrual;
        pto_remaining.max_sick_accrual = pto_counts.max_sick_accrual;
    }

    // If there is carry-in days, apply them here, after we've
    // computed January.
    pto_remaining.sick     += pto_counts.sick_carryin;
    pto_remaining.vacation += pto_counts.vacation_carryin;

    generate_navigation_links()
    
    // Generate the outermost table header
    document.write("<TABLE CLASS='calendar' CELLSPACING=10>\n");
    document.write("<CAPTION><H1>" + name + "'s PTO for " +
                   year + "</H1></CAPTION>\n\n");

    // First row of months - January through April
    document.write("<TR VALIGN=TOP>\n");
    generate_month(1, year, pto_remaining, pto_database, places);
    generate_month(2, year, pto_remaining, pto_database, places);
    generate_month(3, year, pto_remaining, pto_database, places);
    generate_month(4, year, pto_remaining, pto_database, places);
    document.write("</TR>\n");

    // Second row of months - May through August
    document.write("<TR VALIGN=TOP>\n");
    generate_month(5, year, pto_remaining, pto_database, places);
    generate_month(6, year, pto_remaining, pto_database, places);
    generate_month(7, year, pto_remaining, pto_database, places);
    generate_month(8, year, pto_remaining, pto_database, places);
    document.write("</TR>\n");

    // Last row of months - September through December
    document.write("<TR VALIGN=TOP>\n");
    generate_month( 9, year, pto_remaining, pto_database, places);
    generate_month(10, year, pto_remaining, pto_database, places);
    generate_month(11, year, pto_remaining, pto_database, places);
    generate_month(12, year, pto_remaining, pto_database, places);
    document.write("</TR>\n");

    // End of the outermost table
    document.write("</TABLE>\n\n");

    // Footer text
    document.write("<P></P>\n");
    document.write("<TABLE BORDER=1 CELLSPACING=0>\n");
    document.write("<CAPTION><B>Legend</B></CAPTION>\n");
    document.write("<TR><TD CLASS='holiday'>" + company +
                   " Closed</TD></TR>\n");

    if (pto_counts.floating > 0)
        document.write("<TR><TD CLASS='floating'>Floating holiday (" +
                       pto_counts.floating +
                       " total)</TD></TR>\n");

    if (pto_counts.vacation > 0)
    {
        document.write("<TR><TD CLASS='vacation'>Vacation (" +
                       pto_counts.vacation +
                       generate_carryin_text(pto_counts.vacation_carryin,
                                             pto_counts.vacation, places) +
                       " total)");
        if (pto_remaining.vacation_accrual > 0)
        {
            document.write(" (accruing " +
                           toFixedStripZeros(pto_remaining.vacation_accrual,
                                             places) +
                           " days per paycheck");
            if (pto_remaining.max_vacation_accrual > 0)
            {
                document.write(", capped at " +
                               pto_remaining.max_vacation_accrual +
                               " days");
            }
            document.write(")");
        }

        document.write("</TD></TR>\n");
    }

    if (pto_counts.personal > 0)
        document.write("<TR><TD CLASS='personal'>Personal days (" +
                       pto_counts.personal +
                       " total)</TD></TR>\n");

    if (pto_counts.volunteer > 0)
        document.write("<TR><TD CLASS='volunteer'>Volunteer leave (" +
                       pto_counts.volunteer +
                       " total)</TD></TR>\n");

    if (pto_counts.sick > 0)
    {
        document.write("<TR><TD CLASS='sick'>Sick leave (" +
                       pto_counts.sick +
                       generate_carryin_text(pto_counts.sick_carryin,
                                             pto_counts.sick, places) +
                       " total)");
        if (pto_remaining.sick_accrual > 0)
        {
            document.write(" (accruing " +
                           toFixedStripZeros(pto_remaining.sick_accrual,
                                             places) +
                           " days per paycheck");
            if (pto_remaining.max_sick_accrual > 0)
            {
                document.write(", capped at " +
                               pto_remaining.max_sick_accrual +
                               " days");
            }
            document.write(")");
        }

        document.write("</TD></TR>\n");
    }

    if (pto_remaining.unofficial > 0)
        document.write("<TR><TD CLASS='unofficial'>" +
                       "Unofficial/unpaid time off (" +
                       pto_remaining.unofficial +
                       " total)</TD></TR>\n");

    document.write("</TABLE>\n");
    document.write("<P>\n");

    // Warnings for exceding carryover limits.  Note that the carryout
    // warnings assume that pto_remaining has the end-of-december
    // counts loaded.
    //
    generate_carryin_warning("Sick leave", pto_counts.sick_carryin,
                             pto_counts.sick_carryover_limit, places);
    generate_carryin_warning("Vacation", pto_counts.vacation_carryin,
                             pto_counts.vacation_carryover_limit, places);
    generate_carryout_warning("Sick leave", pto_remaining.sick,
                              pto_counts.sick_carryover_limit, places);
    generate_carryout_warning("Vacation", pto_remaining.vacation,
                              pto_counts.vacation_carryover_limit, places);

    document.write("</P><P>\n");

    document.write("Hover your mouse over a time-off date for an " +
                   "explanation.\n");
    document.write("</P>\n");

    generate_navigation_links()
}

/*
 * Generate the HTML file's header content
 */
function generate_header(name, year)
{
    document.write("<TITLE>" + name + "'s PTO for " + year + "</TITLE>\n");
    document.write("<LINK REL='stylesheet' HREF='calendar_generator.css'>\n");
}
