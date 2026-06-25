// Full CRUD implementation for parties.

/**
 * @typedef Party
 * @property {number} id
 * @property {string} name
 * @property {string} description
 * @property {string} date
 * @property {string} location
 */

/**
 * @typedef Rsvp
 * @property {number} id
 * @property {number} guestId
 * @property {number} eventId
 */

/**
 * @typedef Guest
 * @property {number} id
 * @property {string} name
 * @property {string} email
 * @property {string} phone
 * @property {string} bio
 * @property {string} job
 */

// === Constants ===
const BASE = "https://fsa-crud-2aa9294fe819.herokuapp.com/api";
const COHORT = "/2605-ftb-ct-web-pt-kevin";
const EVENT_RESOURCE = "/events";
const RSVP_RESOURCE = "/rsvps";
const GUEST_RESOURCE = "/guests";
const API = BASE + COHORT;

// === State ===
let parties = [];
let selectedParty;
let rsvps = [];
let guests = [];

/** Updates state with all parties from the API */
async function getParties() {
  try {
    const response = await fetch(API + EVENT_RESOURCE);
    const result = await response.json();
    parties = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

/** Updates state with a single party from the API */
async function getParty(id) {
  try {
    const response = await fetch(API + EVENT_RESOURCE + "/" + id);
    const result = await response.json();
    selectedParty = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

/**
 * Updates state by adding a party
 * @param {Party} party
 */
async function addParty(party) {
  try {
    await fetch(API + EVENT_RESOURCE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(party),
    });
  } catch (error) {
    console.log(error);
  }
  getParties();
}

/**
 * Updates state by deleting a party given an id
 * @param {number} id
 */
async function deleteParty(id) {
  try {
    await fetch(API + EVENT_RESOURCE + "/" + id, {
      method: "DELETE",
    });
    getParties();
  } catch (error) {
    console.log(error);
  }
}

/**
 * Updates state by editinig a party given an id and the party object you wish to change it to
 * @param {number} id
 * @param {Party} editedParty
 */
async function editParty(id, editedParty) {
  try {
    await fetch(API + EVENT_RESOURCE + "/" + id, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editedParty),
    });
    getParty(id);
    getParties();
  } catch (error) {
    console.log(error);
  }
}

/** Updates state with all RSVPs from the API */
async function getRsvps() {
  try {
    const response = await fetch(API + RSVP_RESOURCE);
    const result = await response.json();
    rsvps = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

/** Updates state with all guests from the API */
async function getGuests() {
  try {
    const response = await fetch(API + GUEST_RESOURCE);
    const result = await response.json();
    guests = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

// === Components ===

/** Party name that shows more details about the party when clicked
 * @returns {HTMLLIElement}
 */
function PartyListItem(party) {
  const $li = document.createElement("li");

  if (party.id === selectedParty?.id) {
    $li.classList.add("selected");
  }

  $li.innerHTML = `
    <a href="#selected">${party.name}</a>
  `;
  $li.addEventListener("click", () => getParty(party.id));
  return $li;
}

/** A list of names of all parties
 * @returns {HTMLUListElement}
 */
function PartyList() {
  const $ul = document.createElement("ul");
  $ul.classList.add("parties");

  const $parties = parties.map(PartyListItem);
  $ul.replaceChildren(...$parties);

  return $ul;
}

/** Detailed information about the selected party
 * @returns {HTMLParagraphElement | HTMLElement}
 */
function SelectedParty() {
  if (!selectedParty) {
    const $p = document.createElement("p");
    $p.textContent = "Please select a party to learn more.";
    return $p;
  }

  const $party = document.createElement("section");
  $party.innerHTML = `
    <h3>${selectedParty.name} #${selectedParty.id}
      <button>Delete party </button>
    </h3>
    <time datetime="${selectedParty.date}">
      ${selectedParty.date.split("T")[0]}
    </time>
    <address>${selectedParty.location}</address>
    <p>${selectedParty.description}</p>
    <GuestList></GuestList>
    <form></form>
  `;
  $party.querySelector("GuestList").replaceWith(GuestList());
  $party.querySelector("button").addEventListener("click", () => {
    deleteParty(selectedParty.id);
    selectedParty = null;
  });
  $party.querySelector("form").replaceWith(editPartyForm());

  return $party;
}

/** List of guests attending the selected party
 * @returns {HTMLUListElement}
 */
function GuestList() {
  const $ul = document.createElement("ul");
  const guestsAtParty = guests.filter((guest) =>
    rsvps.find((rsvp) => rsvp.guestId === guest.id && rsvp.eventId === selectedParty.id),
  );

  // Simple components can also be created anonymously:
  const $guests = guestsAtParty.map((guest) => {
    const $guest = document.createElement("li");
    $guest.textContent = guest.name;
    return $guest;
  });
  $ul.replaceChildren(...$guests);

  return $ul;
}

/**
 * Returns an HTML form with a submit button and varying amount of label/input pairs
 * @param {string} submitTitle The text to show on the submit button
 * @param  {...any} inputs An input object. Requires a "name" property. Optional type, required, value properties
 * @returns {HTMLFormElement}
 */
function createGenericForm(submitTitle, ...inputs) {
  const $form = document.createElement("form");
  inputs.forEach((input) => {
    const $label = document.createElement("label");
    const $input = document.createElement("input");
    $label.textContent = input.name[0].toUpperCase() + input.name.substring(1);
    $input.name = input.name;
    if (input.type) $input.type = input.type;
    $input.required = input.required ? true : false;
    $input.value = input.value ? input.value : "";
    $label.append($input);
    $form.append($label);
  });
  // Once all inputs iterated on, create one last
  const $submit = document.createElement("input");
  $submit.type = "submit";
  $submit.value = submitTitle;
  $form.append($submit);
  return $form;
}

/**
 * Helper to create and return a form with all required inputs for a party object. Optional default values
 * @param {string} submitTitle
 * @param {string} nameValue
 * @param {string} descriptionValue
 * @param {string} dateValue
 * @param {string} locationValue
 * @returns {HTMLFormElement}
 */
function createPartyForm(submitTitle, nameValue = "", descriptionValue = "", dateValue = "", locationValue = "") {
  return createGenericForm(
    submitTitle,
    { name: "name", required: true, value: nameValue },
    { name: "description", required: true, value: descriptionValue },
    { name: "date", type: "date", required: true, value: dateValue },
    { name: "location", required: true, value: locationValue },
  );
}

/**
 * Create and return a form for adding parties. Also adds event listener for submitting
 * @returns {HTMLFormElement}
 */
function addPartyForm() {
  const $form = createPartyForm("Add party");
  // const $form = document.createElement("form");
  // $form.innerHTML = `
  // <label> Name
  //   <input name = "name" required/>
  // </label>
  // <label> Description
  //   <input name = "description" required/>
  // </label>
  // <label> Date
  //   <input name = "date" type = "date" required/>
  // </label>
  // <label> Location
  //   <input name = "location" required/>
  // </label>
  // <input type = "submit" value = "Add party"/>
  // `;
  $form.addEventListener("submit", (ev) => {
    ev.preventDefault();
    const partyFormData = new FormData($form);
    partyFormData.set("date", new Date(partyFormData.get("date")).toISOString());
    const party = {};
    // Ensure the party object keys match the form names
    for (const key of partyFormData.keys()) party[key] = partyFormData.get(key);
    addParty(party);
  });
  return $form;
}

/**
 * Create and return a form for updating the selected party
 * @returns {HTMLFormElement}
 */
function editPartyForm() {
  const $form = createPartyForm(
    "Save changes",
    selectedParty.name,
    selectedParty.description,
    selectedParty.date.split("T")[0],
    selectedParty.location,
  );
  $form.addEventListener("submit", (ev) => {
    ev.preventDefault();
    const party = {};
    const partyFormData = new FormData($form);
    partyFormData.set("date", new Date(partyFormData.get("date")).toISOString());
    for (const key of partyFormData.keys()) party[key] = partyFormData.get(key);
    editParty(selectedParty.id, party);
  });

  return $form;
}

// === Render ===
function render() {
  const $app = document.querySelector("#app");
  $app.innerHTML = `
    <h1>Party Planner</h1>
    <main>
      <section>
        <h2>Upcoming Parties</h2>
        <PartyList></PartyList>
      </section>
      <section id="selected">
        <h2>Party Details</h2>
        <SelectedParty></SelectedParty>
      </section>
    </main>
    <div id = "addPartyDiv">
      <h2>Add a new party</h2>
      <form></form>
    </div>
  `;

  $app.querySelector("PartyList").replaceWith(PartyList());
  $app.querySelector("SelectedParty").replaceWith(SelectedParty());
  $app.querySelector("#addPartyDiv").querySelector("form").replaceWith(addPartyForm());
}

async function init() {
  await getParties();
  await getRsvps();
  await getGuests();
  render();
}

init();
