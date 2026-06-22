export type EmployeePosition =
  | "Manager"
  | "Waiter"
  | "BB"
  | "Salad"
  | "Porter"
  | "Dish"
  | "Helper"
  | "Pizza"
  | "Cook";

export type Employee = {
  name: string;
  positions: EmployeePosition[];
};

export const employees: Employee[] = [
  { name: "Shiva Prasad", positions: ["Manager", "Waiter"] },
  { name: "Samrina Tamang", positions: ["Manager", "Waiter"] },
  { name: "Daria Pankova", positions: ["Manager", "Waiter"] },
  { name: "Roi Cohen", positions: ["Manager", "Waiter"] },
  { name: "Eugene Ivanov", positions: ["Manager", "Waiter"] },
  { name: "Julio Rosales", positions: ["Manager", "Waiter"] },
  { name: "Shai Levy", positions: ["Manager", "Waiter"] },
  { name: "Jhosue Pumar (David)", positions: ["Waiter"] },
  { name: "Muhammad Elbalam (Mo)", positions: ["Waiter"] },
  { name: "Edgar Lopez", positions: ["BB"] },
  { name: "Luis Ortiz", positions: ["BB"] },
  { name: "Emma Bellomo", positions: ["Waiter"] },
  { name: "Wilian Silva", positions: ["Waiter"] },

  {
    name: "Abelardo Lopez Sanchez",
    positions: ["Salad", "Porter", "Dish", "Helper"],
  },
  {
    name: "Paulino Salgado Juarez",
    positions: ["Salad", "Porter", "Dish", "Helper"],
  },
  {
    name: "Renne Roque",
    positions: ["Cook", "Helper", "Dish", "Salad", "Porter"],
  },
  {
    name: "Santos Lopez",
    positions: ["Cook", "Helper", "Dish", "Salad", "Porter"],
  },
  { name: "Jose Luis Calderon", positions: ["Pizza"] },
  {
    name: "Kebe Macoumba",
    positions: ["Helper", "Dish", "Salad", "Porter"],
  },
  { name: "Roman Sidorski", positions: ["Waiter"] },
  { name: "Md Shamsuzzaman (Zaman)", positions: ["BB"] },
  { name: "Mohamed Maharuch (Simo)", positions: ["BB"] },
  { name: "Mark De Jesus", positions: ["BB"] },
  { name: "Oscar Baten", positions: ["Pizza", "BB"] },
  { name: "Luis Chiqui", positions: ["Cook"] },
  { name: "Luis Gordillo", positions: ["Cook"] },
  { name: "Uche Kalu", positions: ["Pizza"] },
  { name: "Rolando Lopez", positions: ["Pizza"] },
  { name: "Edgar Sanchez Lopez", positions: ["Porter", "Dish"] },
];

function sortEmployees(employeeList: Employee[]): Employee[] {
  return [...employeeList].sort((first, second) =>
    first.name.localeCompare(second.name)
  );
}

export function getCompactEmployeeName(fullName: string): string {
  const nickname = fullName.match(/\(([^)]+)\)/)?.[1]?.trim();
  if (nickname) return nickname;

  const nameParts = fullName.replace(/\s*\([^)]*\)\s*/, "").trim().split(/\s+/);
  return nameParts[0] ?? "";
}

export function getEmployeesForPosition(position: string): Employee[] {
  const normalizedPosition =
    position.trim().toLowerCase() === "server"
      ? "Waiter"
      : position.trim();

  return sortEmployees(
    employees.filter((employee) =>
      employee.positions.some(
        (employeePosition) =>
          employeePosition.toLowerCase() === normalizedPosition.toLowerCase()
      )
    )
  );
}

export const managerNames = getEmployeesForPosition("Manager").map(
  (employee) => employee.name
);

export const compactManagerNames = managerNames.map(getCompactEmployeeName);

export const allEmployeeNames = sortEmployees(employees).map(
  (employee) => employee.name
);
