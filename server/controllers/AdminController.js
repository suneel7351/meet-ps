const AdminSchema = require("../models/admin")
const jwt = require('jsonwebtoken')
const ClientSchema = require("../models/client")
const User = require("../models/user")
const sendMail = require("../utils/sendMail")
const BookedEvents = require("../models/bookedEvent")
class AdminController {


    static adminRegistration = async (req, res) => {
        try {
            const { email, password, name } = req.body
            if (!email || !password || !name) return res.status(400).json({ success: false, message: "All fields are required." })
            let admin = await AdminSchema.findOne({ email })
            if (admin) return res.status(400).json({ success: false, message: "Aleady Register." })

            admin = await AdminSchema.create({
                name, email, password
            })

            const token = await jwt.sign({ username: admin.email }, process.env.ADMIN_SECRET_KEY);

            res.cookie('token', token, {
                maxAge: 86400000,
                httpOnly: true,
                secure: true,
                sameSite: "none",
            }).json({
                success: true, message: "Registered successfully."
            })
        } catch (error) {
            return res.status(500).json({ success: false, message: "Something went wrong." })
        }
    }

    static adminLogin = async (req, res) => {
        try {
            const { email, password } = req.body
            if (!email || !password) return res.status(400).json({ success: false, message: "All fields are required." })
            const admin = await AdminSchema.findOne({ email })
            if (!admin) return res.status(400).json({ success: false, message: "Incorrect email or password." })

            let isMatch = admin.password === password
            if (!isMatch) return res.status(400).json({ success: false, message: "Incorrect email or password." })


            const token = await jwt.sign({ username: admin.email }, process.env.ADMIN_SECRET_KEY);

            res.cookie('token', token, {
                maxAge: 86400000,
                httpOnly: true,
                secure: true,
                sameSite: "none",
            }).json({
                success: true, message: "Logged in successfully."
            })
        } catch (error) {
            return res.status(500).json({ success: false, message: "Something went wrong." })
        }

    }

    static adminLogout = async (req, res) => {
        try {
            res.clearCookie('token', {
                httpOnly: true,
                secure: true,
                sameSite: 'none',
            }).json({ success: true, message: 'Logged out successfully.' });
        } catch (error) {
            return res.status(500).json({ success: false, message: "Something went wrong." })
        }
    }
    static profile = async (req, res) => {
        try {
            const admin = await AdminSchema.findOne({ email: req.admin.email }).populate({
                path: "events", populate: [
                    { path: "user", model: "user" },
                    { path: "client", model: "client" },
                ],
            })

            if (!admin) return res.status(400).json({ success: false, message: "Unauthorized." })
            let data = {
                email: admin.email,
                events: admin.events
            }


            res.status(200).json({
                success: true, admin: data
            })

        } catch (error) {
            return res.status(500).json({ success: false, message: "Something went wrong." })
        }
    }
    static createClient = async (req, res) => {
        try {
            const { name, company, email, password } = req.body
            let client = await ClientSchema.findOne({ email })
            if (client) return res.status(400).json({ success: false, message: "Client already present with this email." })

            client = new ClientSchema({ name, company, email, password })
            client = await client.save()

            const html = `<!DOCTYPE html>
            <html>
            <head>
              <style>
                body {
                  font-family: Arial, sans-serif;
                }
            
                .container {
                  max-width: 500px;
                  margin: 0 auto;
                  padding: 20px;
                  background-color: #f7f7f7;
                  border: 1px solid #ccc;
                }
            
                h1 {
                  color: #333;
                  text-align: center;
                }
            
                p {
                  color: #555;
                  line-height: 1.5;
                }
            
                .credentials {
                  margin-top: 30px;
                  background-color: #fff;
                  padding: 20px;
                  border: 1px solid #ccc;
                }
            
                .label {
                  font-weight: bold;
                  margin-bottom: 8px;
                }
            
                .value {
                  font-size: 14px;
                }
                .video{
                    margin-left:2px;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <h1>Account Credentials</h1>
                <p>Dear ${client.name},</p>
                <p>Here are your login credentials for ${process.env.CLIENT_URL}</p>
            
                <div class="credentials">
                  <p class="label">Email Address: <span class="value">${client.email}</span></p>
                  
                  <p class="label">Password:  <span class="value">${client.password}</span></p>
                 
                </div>
                <br></br>
                <p><span class="video">Please refer to this video for an understanding - </span> <span> https://youtu.be/nRmdMWYFr8U</span></p>
                <p>Regards,</p>
                <p>CEOITBOX</p>
              </div>
            </body>
            </html>
            `
            await sendMail(client.email, `Email for login | ${client.company}`, html)

            res.status(200).json({
                success: true, message: "Client is created successfully."
            })

        } catch (error) {
            return res.status(500).json({ success: false, message: "Something went wrong." })
        }
    }
    static createClientForScript = async (req, res) => {
        try {
            const { name, company, email, password } = req.body
            if (req.params.token !== process.env.ADMIN_CLIENT_TOKEN) return res.status(400).json({ success: false, message: "Unauthorized." })
            if (!name || !company || !email || !password) return res.status(400).json({ success: false, message: "All fields are required." })
            let client = await ClientSchema.findOne({ email })
            if (client) return res.status(200).json({ success: false, message: "Client already present with this email." })

            client = new ClientSchema({ name, company, email, password })
            client = await client.save()

            const html = `<!DOCTYPE html>
            <html>
            <head>
              <style>
                body {
                  font-family: Arial, sans-serif;
                }
            
                .container {
                  max-width: 500px;
                  margin: 0 auto;
                  padding: 20px;
                  background-color: #f7f7f7;
                  border: 1px solid #ccc;
                }
            
                h1 {
                  color: #333;
                  text-align: center;
                }
            
                p {
                  color: #555;
                  line-height: 1.5;
                }
            
                .credentials {
                  margin-top: 30px;
                  background-color: #fff;
                  padding: 20px;
                  border: 1px solid #ccc;
                }
            
                .label {
                  font-weight: bold;
                  margin-bottom: 8px;
                }
            
                .value {
                  font-size: 14px;
                }
                .video{
                    margin-left:2px;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <h1>Account Credentials</h1>
                <p>Dear ${client.name},</p>
                <p>Here are your login credentials for ${process.env.CLIENT_URL}</p>
            
                <div class="credentials">
                  <p class="label">Email Address: <span class="value">${client.email}</span></p>
                  
                  <p class="label">Password:  <span class="value">${client.password}</span></p>
                 
                </div>
                <br></br>
                <p><span class="video">Please refer to this video for an understanding - </span> <span> https://youtu.be/nRmdMWYFr8U</span></p>
                <p>Regards,</p>
                <p>CEOITBOX</p>
              </div>
            </body>
            </html>
            `
            await sendMail(client.email, `Email for login | ${client.company}`, html)

            res.status(200).json({
                success: true, message: "Client is created successfully."
            })

        } catch (error) {
            console.log(error)
            return res.status(500).json({ success: false, message: "Something went wrong." })
        }
    }
    static getAllClients = async (req, res) => {
        try {


            const { name, email, company } = req.query;
            let query = {};

            if (name) {
                query.name = { $regex: name, $options: 'i' };
            }

            if (email) {
                query.email = { $regex: email, $options: 'i' }; email
            }

            if (company) {
                query.company = { $regex: company, $options: 'i' };
            }


            let clients = await ClientSchema.find(query)


            res.status(200).json({
                success: true, clients: clients.reverse()
            })

        } catch (error) {
            return res.status(500).json({ success: false, message: "Something went wrong." })
        }
    }
    static getAllUsers = async (req, res) => {
        try {
            const { name, email } = req.query;
            let query = {};

            if (name) {
                query.name = { $regex: name, $options: 'i' };
            }

            if (email) {
                query.email = { $regex: email, $options: 'i' }; email
            }
            let users = await User.find(query)


            res.status(200).json({
                success: true, users: users.reverse()
            })

        } catch (error) {
            return res.status(500).json({ success: false, message: "Something went wrong." })
        }
    }
    static updateApprove = async (req, res) => {
        try {
            const { _id } = req.body
            let user = await User.findById(_id)
            user.approve = !user.approve
            await user.save()

            const users = await User.find({})
            res.json({ success: true, users: users.reverse() });
        } catch (error) {
            res.status(500).json({ message: 'Internal server error' });
        }
    }
    static deleteClient = async (req, res) => {
        try {
            const { id } = req.params;
            let client = await ClientSchema.deleteOne({ _id: id });
            const clients = await ClientSchema.find({})
            res.json({ success: true, clients: clients.reverse() });
        } catch (error) {
            res.status(500).json({ success: false, message: "Internal server error" });
        }
    };

    static updateClient = async (req, res) => {
        try {
            const { name, company, email, password, _id } = req.body
            let client = await ClientSchema.findById(_id)
            if (name) client.name = name
            if (company) client.company = company
            if (email) client.email = email
            if (password) client.password = password
            await client.save()

            const clients = await ClientSchema.find({})

            res.json({ success: true, clients: clients.reverse() });
        } catch (error) {
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    static updateClientApprove = async (req, res) => {
        try {
            const { _id } = req.body
            let client = await ClientSchema.findById(_id)
            client.approve = !client.approve
            await client.save()

            const clients = await ClientSchema.find({})
            res.json({ success: true, clients: clients.reverse() });
        } catch (error) {
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    static getAllBookedEvents = async (req, res) => {
        try {
            const bookedEvents = await BookedEvents.find({}).populate([
                { path: "user", model: "user" },
                { path: "client", model: "client" },
            ]);

            res.status(200).json({ success: true, bookedEvents })

        } catch (error) {
            res.status(500).json({ message: 'Internal server error' });
        }
    }
    static getUserDetailsToScheduling = async (req, res) => {
        try {
            if (req.params.token !== process.env.ADMIN_CLIENT_TOKEN) return res.status(400).json({ success: false, message: "Unauthorized." })
            const users = await User.find({}).select("-avatar -refresh_token -_id -approve -weekdays -timeSlots -event -events -calendars -holidays -expertIn -registered")
            res.status(200).json({ success: true, users })

        } catch (error) {
            res.status(500).json({ message: 'Internal server error' });
        }
    }



}


module.exports = AdminController