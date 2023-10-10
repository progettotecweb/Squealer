# How to use Auth

## Login

Go to `/Login` or `/Home/Login` to log in or register.
> Note: The login page is in a primal state and must be improved. We should add password validation for registering.

## Logout
To logout, run a GET request to `/Home/api/signOut`, like this:
```javascript
fetch("/Home/api/signOut", {
    method: "GET",
    headers: {
        "Content-Type": "application/json"
    }
})
```
this removes the session cookie and should redirect to the login page.
> # Note
> I have not yet tested this as in Next i can directly use the `signOut` function from `next-auth/client`. This should however work.

## Authentication

To get the user's authentication status, run a GET request to `/Home/api/user`, , like this:
```javascript
const userData = await fetch("/Home/api/user", {
    method: "GET",
    headers: {
        "Content-Type": "application/json"
    }
}).then(res => res.json())
```
This should return a JSON object with the user's data, or an error message if the user is not logged in.
> # Note
> We could add toasts to tell that the user should log in, insted of loggin the error message in the console. This should however be handled in different modes depending on what part of the app we are in.

## Route Protection

In the `utils.js` file, there are now two functions that can be used to protect routes. These are `auth` and `checkRole`. These functions are `express` middlewares that can be used like this:
```javascript
// only authenticated users can access this route
...
app.get("/protectedRoute", auth, (req, res) => {
    ...
})

// example: the `/api/squeal` route creates a squeal. A user logged in as guest should not be able to create a squeal, so we can protect the route.
```
If an authenticated user tries to access this route, a 401 error (Unhautorized) will be returned.

Furthermore, we can also check if the user has a specific role, like this:
```javascript
// only users with the role "Mod" can access this route
...
app.get("/protectedRoute", auth, checkRole(["Mod"]), (req, res) => {
    ...
})

// example: all of the moderator dashboard routes should be protected.
```
As before, if the user is not logged in or if the user does not have the role "Mod", a 401 error will be returned.

> # Note
> The order of the middlewares is important: for now, the auth middleware exposes the `user.role` property of the token, so it must be run before the checkRole middleware.
> This could be changed in the future, but for now, this is how it works.

> # Another note
> The `checkRole` middleware can also be used to check if the user has multiple roles, like this:
> ```javascript
> // only users with the role "Mod" or "Admin" can access this route
> ...
> app.get("/protectedRoute", auth, checkRole(["Mod", "Admin"]), (req, res) => {
>     ...
> })
> ```

