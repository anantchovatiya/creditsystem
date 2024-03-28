const mongoose = require("mongoose");
const express = require("express");
const path = require("path");
const user = require("./database/user.models");
const Transactions = require("./database/transaction.models");
const loan = require("./database/loan.models");
const app = express();
const port = 3000
const nri = require('./routes/nri')
const local = require('./routes/user')
const url = "mongodb+srv://anantchovatiya:Uf1bZiZGko7ZJ22s@cluster0.rkkycsk.mongodb.net/";
const accountSid = 'AC18227acd8181efea7a1da4ff8b8e9f3e';
const authToken = '1e7f8587e7f6ce70d2c2671cb16b6092';
const client = require('twilio')(accountSid, authToken);
const favicon = require('serve-favicon');
let curraccno;
let currphone;

app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.use(favicon(path.join(__dirname, './favicon.ico')));

main().catch(err => console.log(err));

app.use('/nri.html', nri)
app.use('/user.html', local)



app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './index.html'));
});

app.get('/index.html', (req, res) => {
    res.sendFile(path.join(__dirname, "./index.html"));
});

app.get("/loginuser.html", (req, res) => {
    res.sendFile(path.join(__dirname, "./loginuser.html"));
})
app.get("/loginnri.html", (req, res) => {
    res.sendFile(path.join(__dirname, "./loginnri.html"));
})
app.get("/contact.html", (req, res) => {
    res.sendFile(path.join(__dirname, "./contact.html"));
})
app.get("/createaccount.html", (req, res) => {
    res.sendFile(path.join(__dirname, "./createaccount.html"));
})


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})


async function main() {
    await mongoose.connect(url);
}
app.use(express.urlencoded({ extended: true }));


app.post("/login_user", async(req, res) => {
    const data = req.body;
    let ans = await user.find({ username: data.name, password: data.password, type: "indian" });

    if (ans.length > 0) {
        let tran = await Transactions.find({ from: ans[0].accountno }).sort({ date: 'desc' });
        let loaninfo = await loan.find({ accno: ans[0].accountno });
        curraccno = ans[0].accountno;
        currphone = ans[0].mobile;
        if (loaninfo.length > 0) {
            res.render("dashboarduser", {
                username: ans[0].username.toLocaleUpperCase(),
                accno: ans[0].accountno,
                bal: ans[0].balance,
                type: ans[0].type.toLocaleUpperCase(),
                tran: tran,
                loanamt: loaninfo[0].amt,
                loandur: loaninfo[0].month,
                loantype: loaninfo[0].type

            })
        } else if (loaninfo.length == 0) {
            res.render("dashboarduser", {
                username: ans[0].username.toLocaleUpperCase(),
                accno: ans[0].accountno,
                bal: ans[0].balance,
                type: ans[0].type.toLocaleUpperCase(),
                tran: tran,
                loanamt: 0,
                loandur: 0,
                loantype: "-"
            })


        }
    } else {
        res.render("error", {
            err: "Your Username or password is incorrect!"
        });
    }
})

app.post("/login_nri", async(req, res) => {
    const data = req.body;
    let ans = await user.find({ username: data.name, password: data.password, type: "nri" });

    if (ans.length > 0) {
        let tran = await Transactions.find({ from: ans[0].accountno }).sort({ date: 'desc' });


        curraccno = ans[0].accountno;
        currphone = ans[0].mobile;
        res.render("dashboardnri", {
            username: ans[0].username.toLocaleUpperCase(),
            accno: ans[0].accountno,
            bal: ans[0].balance,
            type: ans[0].type.toLocaleUpperCase(),
            tran: tran


        })
    } else {
        res.render("error", {
            err: "Your Username or password is incorrect!"
        });
    }
})

app.post("/create", (req, res) => {
    const data = req.body;
    let accountNumber = '';
    const digits = '0123456789';

    for (let i = 0; i < 12; i++) {
        const randomIndex = Math.floor(Math.random() * digits.length);
        accountNumber += digits[randomIndex];
    }
    const newuser = new user({
        username: data.username,
        password: data.password,
        email: data.email,
        type: data.type,
        accountno: accountNumber,
        mobile: data.mobile
    });
    newuser.save();
    client.messages
        .create({
            body: 'Welcome to Credit System!! Your Account  has been created successfully! Your Account Number is:' + accountNumber + ' and password is:' + data.password,
            from: '+15104048408',
            to: '+91' + data.mobile
        })
        .then()
        .catch(error => console.error(error));
    res.render("mess", {
        mess: "Your account has been created successfully!"
    });

})

app.post("/transfer", async(req, res) => {
    const data = req.body;
    let accfrom = await user.find({ accountno: data.from_account });
    let accto = await user.find({ accountno: data.to_account });
    if (accto.length === 0) {
        return res.render("error", {
            err: "Acoount Number is Incorrect"
        })
    }

    var fromamount = parseFloat(data.amount);
    if (fromamount > accfrom[0].balance) {
        return res.render("error", {
            err: "Insufficient  Balance in Sender Account!"
        })
    } else {
        user.updateOne({ accountno: data.from_account }, { $set: { balance: accfrom[0].balance - fromamount } }).exec();
        user.updateOne({ accountno: data.to_account }, { $set: { balance: accto[0].balance + fromamount } }).exec();
    }

    const trans = new Transactions({
        amt: data.amount,
        to: accto[0].accountno,
        from: accfrom[0].accountno,
        name: accto[0].username,
        status: "debit"

    })
    client.messages
        .create({
            body: 'Your Account  has been debited of INR ' + data.amount + 'Available Balance is ' + (accfrom[0].balance - data.amount),
            from: '+15104048408',
            to: '+91' + accfrom[0].mobile
        })
        .then()
        .catch(error => console.error(error));
    trans.save();
    const trans1 = new Transactions({
        amt: data.amount,
        to: accfrom[0].accountno,
        from: accto[0].accountno,
        name: accfrom[0].username,
        status: "credit"

    })
    client.messages
        .create({
            body: 'Your Account  has been credited of INR ' + data.amount + 'Available Balance is ' + (parseInt(accto[0].balance) + parseInt(data.amount)),
            from: '+15104048408',
            to: '+91' + accto[0].mobile
        })
        .then()
        .catch(error => console.error(error));
    trans1.save();
    res.render("mess", { mess: "Fund Transfered sucessfully!!" })
})

app.get("/loan", async(req, res) => {
    let data = await user.find({ accountno: curraccno });

    res.render("loan", {
        accno: data[0].accountno,
        email: data[0].email,
        mobile: data[0].mobile
    });
})

app.post("/loan", async(req, res) => {
    let data = req.body;
    let ans = await user.find({ accountno: curraccno });
    user.updateOne({ accountno: curraccno }, { $set: { balance: parseInt(ans[0].balance) + parseInt(data.amount) } }).exec();
    const newloan = new loan({
        accno: data.accno,
        amt: data.amount,
        month: data.term,
        type: data.type
    })
    newloan.save();
    client.messages
        .create({
            body: 'You have successfully applied for the Loan of ' + data.amount + 'INR. Your loan term is ' + data.term + ' months. Your loan Amount will be credited soon in your account in next 24 hrs',
            from: '+15104048408',
            to: '+91' + currphone
        })
    setTimeout(() => {
        user.updateOne({ accountno: curraccno }, { $set: { balance: parseInt(ans[0].balance) + parseInt(data.amount) } }).exec();
        const trans = new Transactions({
            amt: data.amount,
            to: data.accno,
            from: data.accno,
            name: "Credit System",
            status: "loan"

        })
        trans.save();
        client.messages
            .create({
                body: 'Your Loan amount ' + data.amount + ' INR has been successfully credited into your Account. Kindly check your account balance.',
                from: '+15104048408',
                to: '+91' + currphone
            })
    }, 6000);
    res.render("mess", { mess: "Loan Applied sucessfully!!" })
})


app.post("/withdraw", async(req, res) => {
    const data = req.body;
    let ans = await user.find({ accountno: curraccno });
    if (ans[0].balance < data.amount) {
        return res.render("error", {
            err: "Insufficient Balance"
        });
    } else {
        client.messages
            .create({
                body: 'Your request for Withdrawal has been successfully of ' + data.amount + 'INR. Your Amount will be debited soon in your account in next 24 hrs',
                from: '+15104048408',
                to: '+91' + currphone
            })
        res.render("mess", { err: "Withdrawal Request Placed Successfully" })
        setTimeout(() => {
            user.updateOne({ accountno: curraccno }, { $set: { balance: parseInt(ans[0].balance) - parseInt(data.amount) } }).exec();
            const trans = new Transactions({
                amt: data.amount,
                to: data.accountNumber,
                from: curraccno,
                name: "Credit System",
                status: "Withdraw"

            })
            trans.save();
            client.messages
                .create({
                    body: 'Your Request of amount ' + data.amount + ' INR has been successfully debited into your Account. Kindly check your account balance.',
                    from: '+15104048408',
                    to: '+91' + currphone
                })
        }, 6000);
    }
})
