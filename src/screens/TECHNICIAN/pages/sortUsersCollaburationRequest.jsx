// sortUsers.js

export const sortUsers = (users, type) => {
  let sortedUsers;
  switch (type) {
    case "alphabetically-name":
      sortedUsers = [...users].sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "alphabetically-title":
      sortedUsers = [...users].sort((a, b) => a.title.localeCompare(b.title));
      break;
    case "time-old-new":
      sortedUsers = [...users].sort((a, b) => a.time.localeCompare(b.time));
      break;
    case "time-new-old":
      sortedUsers = [...users].sort((a, b) => b.time.localeCompare(a.time));
      break;
    default:
      sortedUsers = users; // Return unsorted if no valid sort type
  }
  return sortedUsers;
};
