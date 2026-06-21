// Function to parse the date string in DD/MM/YYYY format
export const parseDate = (dateString) => {
  const [day, month, year] = dateString.split("/");
  return new Date(`${year}-${month}-${day}`);
};

// Function to apply filters to data
const filterData = (data, filters) => {
  return data.filter((item) => {
    let isValid = true;

    if (filters.date && item.date !== filters.date) {
      isValid = false;
    }
    if (filters.status && item.status !== filters.status) {
      isValid = false;
    }
    if (filters.department && item.department !== filters.department) {
      isValid = false;
    }
    if (filters.urgency && item.priority !== filters.urgency) {
      isValid = false;
    }

    return isValid;
  });
};

// Function to sort and filter data based on the provided config
export const sortAndFilterData = (data, { key, direction }, filters) => {
  // First, apply filters
  const filteredData = filterData(data, filters);

  // Then, sort the filtered data
  return filteredData.sort((a, b) => {
    let aValue = a[key];
    let bValue = b[key];

    // Parse dates if sorting by the date key
    if (key === "date") {
      aValue = parseDate(aValue);
      bValue = parseDate(bValue);
    }

    // Sorting logic based on direction
    if (direction === "ascending") {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
    }
  });
};
