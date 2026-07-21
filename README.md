# Web Development Project 7 - Crewmates

Submitted by: **Sabid Mahmud**

This web app: **A simple Crewmates app where users can create, view, update, and delete crewmates.**

Time spent: **4** hours spent in total

## Required Features

The following **required** functionality is completed:

- [x] The web app contains a page that features a create form to add a new crewmate
- [x] Users can name the crewmate
- [x] Users can set the crewmate's attributes by clicking on one of several values
- [x] The web app includes a summary page of all the user's added crewmates
- [x] The summary page is sorted by creation date such that the most recently created crewmates appear at the top
- [x] A previously created crewmate can be updated from the list of crewmates in the summary page
- [x] Each crewmate has an edit button that will take users to an update form for the relevant crewmate
- [x] Users can see the current attributes of their crewmate on the update form
- [x] After editing the crewmate's attribute values using the form, the user can immediately see those changes reflected in the update form and on the summary page
- [x] A previously created crewmate can be deleted from the crewmate list
- [x] Using the edit form from Required Feature 3, there is a button that allows users to delete that crewmate
- [x] After deleting a crewmate, the crewmate should no longer be visible in the summary page
- [x] Each crewmate has a direct, unique URL link to an info page about them
- [x] Clicking on a crewmate in the summary page navigates to the detail view page for that crewmate
- [x] The detail page contains extra information about the crewmate not included in the summary page
- [x] Users can navigate to the edit form from the detail page

## Stretch Features

The following **stretch** features are implemented:

- [ ] A crewmate can be given a category upon creation which restricts their attribute options
- [ ] A section of the summary page displays summary statistics about a user's crew
- [ ] The site displays a custom success metric about a user's crew which changes the look of the crewmate list

## Video Walkthrough

Here's a walkthrough of implemented user stories:

Add GIF link here

GIF created with **ScreenToGif**

## Notes

- The app is Supabase-ready through `@supabase/supabase-js`.
- If Supabase environment variables are not set, the app uses browser storage so the project can still be tested locally.
- Expected Supabase table name: `crewmates`.
- Suggested Supabase columns: `id`, `name`, `speed`, `color`, `notes`, and `created_at`.

## License

    Copyright 2026 Sabid Mahmud

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
