/**
 * --------------------------
 * MAKE API SECURED
 * -----------------------
 * The person who have access should be able to see the data only
 * 
 * 
 * concept : 
 * 1. assign 2 tokens for each person. (access token & refresh token)
 * 2. access token contains : user identification (email, role, etc.) - valdi for a shorter duration
 * 3. refresh token is used : this is used to recreate the access token
 * 4. if refresh token gets invalid then logout the user. 
 * */


/** 
 * 1.JWT - Json Web Token
 * 2.generate a token by using jwt.sign
 * 3.create api set to cookie. httpOnly, secure, sameSite
 * 4.from clientside: axios withCredentials: true
 * 5. cors setup. origin amd credentials : true
 * 
 */

/**
 * 1.for secure api calls
 * server side:
 * 2.install cookie parser and use it as a middleware
 * 3.req.cookies
 * 4. client side: 
 * 5.make api calls using axios withCredentials:'true' or withCredentials:'include' while using fetch. 
 * 6.Do not repeat the same task in the same app (Do not repeat yourself - DRY). rather do once & apply everywhere
 */