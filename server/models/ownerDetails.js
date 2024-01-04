// import mongoose from 'mongoose';
// const ObjectId = mongoose.Types.ObjectId;

// const ownerSchema = new mongoose.Schema({
//     first_name: {
//         type: String,
//         required: true
//       },
//       last_name: {
//         type: String,
//         required: true
//       },
//       address: {
//         type: String
//       },
//       phone: {
//         type: String,
//         required: true
//       },
//       occupation: {
//         type: String,
//         required: true
//       },
//       state: {
//         type: String,
//         required: true
//       },
//       location: {
//         type: String
//       },
//       pin_code: {
//         type: String,
//         required: true
//       },
//       properties:[{
//         type: ObjectId,
//         ref: "Property",
//       }]
// })

// const ownerModel = mongoose.model( 'Owner', ownerSchema)
 
// export default ownerModel;