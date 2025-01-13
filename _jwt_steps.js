/**
 * Install jsonwebtoken
 * jwt.sign (payload, secret, {expiresIN:})
 * token client
 * 
 */


/**
 *how to store token in the client side 
 1. memory --> ok type
 2. local storage --> ok type (XSS)
 3. cookies: http only <we prefere this option>
 */


/**
 * 1. Set cookies with http only. for development secure: false,
 * 2. cors setup 
 * 
 app.use(express.json());
 app.use(cors({
     origin:['http://localhost:5173'], //Deveopment er jonno local host. Production e gele production er link die etake replace kore dite hobe. 
     credentials: true // Normally cookies same server e kj kore. etake cross origin server e kaj koranor jonno credentials true kora hoyeche. 
 }));
 * 3. client side axios setting
 in exios set withCredentials : true

 Note - To send cookies from the client make sure you added withCredential : true for the api call using axios/fetch. 
 
 */