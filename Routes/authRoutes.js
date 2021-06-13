const { Router } = require("express");
const { checkValidation } = require("../middleware/validate");
const { Send } = require("../middleware/Send");
const { executeValidation } = require("../middleware/executeValidation");
const { authenticate } = require("../middleware/authentication");
const { authorized } = require("../middleware/authorization");


const { register, login } = require("../Controllers/userController");
const { grantAccessToClass } = require("../Controllers/userController");
const { applyForTheClass, removeStudentFromClass, getListOfClasses, getAllAppliedStudent } = require("../Controllers/studentController");
const { createClass, listAllClass, listAllStudentInClass, updateClass, deleteClass, listAllClasses } = require("../Controllers/classController");


const router = Router();


/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: The Authentication API
*/


/**
 * @swagger
 * tags:
 *   name: Insructor Class
 *   description: The Instructor Managing Class Api
*/

/**
 * @swagger
 * tags:
 *   name: Managing Participation
 *   description: The Instructor Managing Participation of Student Api
*/



/**
 * @swagger
 * paths:
 *  /api/v1/register:
 *    post:
 *     tags: [Auth]
 *     summary: Adds a new user
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:      # Request body contents
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                  type:string
 *               password:
 *                 type: string
 *               roles:
 *                  type:string
 *             example: 
 *               name:  Abhi
 *               email: a@gmail.com
 *               password: student1$
 *               roles: student || instructor
 *     responses:
 *      '200':
 *         description: OK
 */



// Authentication Routes

/* Register route*/
router.post("/api/v1/register", [
  checkValidation("USER_REGISTRATION"),
  executeValidation,
  register,
  Send,
]);


/**
 * @swagger
 * paths:
 *  /api/v1/login:
 *    post:
 *     tags: [Auth]
 *     summary: Adds a new user
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:      # Request body contents
 *             type: object
 *             properties:
 *               email:
 *                  type:string
 *               password:
 *                  type:string
 *             example: 
 *               email: a@gmail.com
 *               password: password1$
 *     responses:
 *      '200':
 *         description: OK
 */


/* Login route*/
router.post("/api/v1/login", [
  checkValidation("USER_LOGIN"),
  executeValidation,
  login,
  Send,
]);






// Instructor Managing the class

/**
 * @swagger
 * paths:
 *   /api/v1/class/create:
 *    post:
 *     security:            
 *      - jwt: [] 
 *    
 *     securityDefinitions:
 *       BasicAuth:
 *         type: basic
 *         name: Authorization
 *         -in: header
 *     tags: [Insructor Class]
 *     summary: Adds a new class(for instructor role)
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:      # Request body contents
 *             type: object
 *             properties:
 *               title:
 *                  type:string
 *               classDate:
 *                  type:string
 *               endTime:
 *                  type:string
 *               startTime:
 *                  type:string
 *               studentLimit:
 *                  type:string
 *             example: 
 *               title: sometitle
 *               classDate: 2021-06-20
 *               startTime: 2021-06-20,19:00
 *               endTime: 2021-06-20,20:00
 *               studentLimit: 2 
 *     responses:
 *      '200':
 *         description: OK
 */


/* Creating the class*/
router.post("/api/v1/class/create", [
  authenticate,
  authorized("instructor"),
  checkValidation("CREATE_CLASS"),
  executeValidation,
  createClass,
  Send,
]);

/**
 * @swagger
 * paths:
 *   /api/v1/class/list:
 *    get:
 *     security:            
 *      - jwt: [] 
 *    
 *     securityDefinitions:
 *       BasicAuth:
 *         type: basic
 *         name: Authorization
 *         -in: header
 *     tags: [Insructor Class]
 *     summary: List all classes created by the instructor(for instructor role)
 *     responses:
 *      '200':
 *         description: OK
 */

/* List all classes created by the instructor */
router.get("/api/v1/class/list", [
  authenticate,
  authorized("instructor"),
  listAllClass,
  Send,
]);


/**
 * @swagger
 * paths:
 *   /api/v1/class/edit/{classId}:
 *    patch:
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *     security:            
 *      - jwt: [] 
 *    
 *     securityDefinitions:
 *       BasicAuth:
 *         type: basic
 *         name: Authorization
 *         -in: header
 *     tags: [Insructor Class]
 *     summary: Updating the class created by intructor(for instructor role)
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:      # Request body contents
 *             type: object
 *             properties:
 *               title:
 *                  type:string
 *               classDate:
 *                  type:string
 *               endTime:
 *                  type:string
 *               startTime:
 *                  type:string
 *               studentLimit:
 *                  type:string
 *             example: 
 *               title: sometitle
 *               classDate: 2021-06-20
 *               startTime: 2021-06-20,19:00
 *               endTime: 2021-06-20,20:00
 *               studentLimit: 2 
 *     responses:
 *      '200':
 *         description: OK
 */

/*Updating the class*/
router.patch("/api/v1/class/edit/:classId", [
  authenticate,
  authorized("instructor"),
  updateClass,
  Send
]);



/**
 * @swagger
 * paths:
 *   /api/v1/class/delete/{classId}:
 *    delete:
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *     security:            
 *      - jwt: [] 
 *    
 *     securityDefinitions:
 *       BasicAuth:
 *         type: basic
 *         name: Authorization
 *         -in: header
 *     tags: [Insructor Class]
 *     summary: Deleting the class by instructor (for instructor role)
 *
 *     responses:
 *      '200':
 *         description: OK
 */

/*Deleting the class */
router.delete("/api/v1/class/delete/:classId", [
  authenticate,
  authorized("instructor"),
  deleteClass,
  Send
]);




// Managing Student Participation in class




/**
 * @swagger
 * paths:
 *   /api/v1/student/allclass/list:
 *    get:
 *     security:            
 *      - jwt: [] 
 *    
 *     securityDefinitions:
 *       BasicAuth:
 *         type: basic
 *         name: Authorization
 *         -in: header
 *     tags: [Managing Participation]
 *     summary: get list of all classes avilable(for student role)
 *     responses:
 *      '200':
 *         description: OK
 */
//get list of all classes avilable

 router.get("/api/v1/student/allclass/list", [
  authenticate,
  authorized("student"),
  listAllClasses,
  Send
]);



/**
 * @swagger
 * paths:
 *   /api/v1/student/apply/{classId}:
 *    put:
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *     security:            
 *      - jwt: [] 
 *    
 *     securityDefinitions:
 *       BasicAuth:
 *         type: basic
 *         name: Authorization
 *         -in: header
 *     tags: [Managing Participation]
 *     summary: Student Applied for the class(for student role)
 *
 *     responses:
 *      '200':
 *         description: OK
 */


/* Student Applied for the class*/

router.put("/api/v1/student/apply/:classId", [
  authenticate,
  authorized("student"),
  applyForTheClass,
  Send
]);



/**
 * @swagger
 * paths:
 *   /api/v1/student/apply/{classId}:
 *    get:
 *     security:            
 *      - jwt: [] 
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *    
 *     securityDefinitions:
 *       BasicAuth:
 *         type: basic
 *         name: Authorization
 *         -in: header
 *     tags: [Managing Participation]
 *     summary: Get Applied Student in the class(for instructor role)
 *     responses:
 *      '200':
 *         description: OK
 */

/* Get Applied Student in the class*/



router.get("/api/v1/student/apply/:classId", [
  authenticate,
  authorized("instructor"),
  getAllAppliedStudent,
  Send
]);




/**
 * @swagger
 * paths:
 *   /api/v1/instructor/{userId}/{classId}:
 *    put:
 *     security:            
 *      - jwt: [] 
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *       - in: path
 *         name: classId
 *         required: true
 *    
 *     securityDefinitions:
 *       BasicAuth:
 *         type: basic
 *         name: Authorization
 *         -in: header
 *     tags: [Managing Participation]
 *     summary: Grant access to the class(for instructor role)
 *     responses:
 *      '200':
 *         description: OK
 */

/*Grant access to the class*/
router.put("/api/v1/instructor/:userId/:classId", [
  authenticate,
  authorized("instructor"),
  grantAccessToClass,
  Send
]);



/**
 * @swagger
 * paths:
 *   /api/v1/student/list/{classId}:
 *    get:
 *     security:            
 *      - jwt: [] 
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *    
 *     securityDefinitions:
 *       BasicAuth:
 *         type: basic
 *         name: Authorization
 *         -in: header
 *     tags: [Managing Participation]
 *     summary: Get List of all Student in the class(for instructor role)
 *     responses:
 *      '200':
 *         description: OK
 */


/* Get List of all Student in the class*/
router.get("/api/v1/student/list/:classId", [
  authenticate,
  authorized("instructor"),
  listAllStudentInClass,
  Send
])

/**
 * @swagger
 * paths:
 *   /api/v1/student/remove/{userId}/{classId}:
 *    delete:
 *     security:            
 *      - jwt: [] 
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *       - in: path
 *         name: classId
 *         required: true
 *    
 *     securityDefinitions:
 *       BasicAuth:
 *         type: basic
 *         name: Authorization
 *         -in: header
 *     tags: [Managing Participation]
 *     summary: Remove Student from the class(for instructor role)
 *     responses:
 *      '200':
 *         description: OK
 */

/*Remove Student from the class*/
router.delete("/api/v1/student/remove/:userId/:classId", [
  authenticate,
  authorized("instructor"),
  removeStudentFromClass,
  Send
]);



/**
 * @swagger
 * paths:
 *   /api/v1/student/class/list/:
 *    get:
 *     security:            
 *      - jwt: [] 
 *    
 *     securityDefinitions:
 *       BasicAuth:
 *         type: basic
 *         name: Authorization
 *         -in: header
 *     tags: [Managing Participation]
 *     summary: Student see all classes he enrolled(for student role)
 *     responses:
 *      '200':
 *         description: OK
 */


// Student see all classes he enrolled
router.get("/api/v1/student/class/list/", [
  authenticate,
  authorized("student"),
  getListOfClasses,
  Send
]);





module.exports = router;