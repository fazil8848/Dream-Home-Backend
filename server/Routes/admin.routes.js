import express from 'express';
import adminController from "../controllers/admin.controller.js"

const router  = express.Router();


//GET
router.get('/getUsers',adminController.getUsers);
router.get('/getOwners',adminController.getOwners);
router.get('/getKycs',adminController.getKYCs);
router.get('/getProperties',adminController.getProperties);

//POST
router.post('/login',adminController.adminLogin);
router.post('/logout',adminController.adminLogout);

//PUT
router.put('/blockUser',adminController.blockUser);
router.put('/blockOwner',adminController.blockOwner);
router.put('/propertyApproval',adminController.propertyApproval);

//PATCH 
router.patch('/approveKyc',adminController.approveKyc)


export default router;