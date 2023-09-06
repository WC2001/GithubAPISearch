const {UserService} = require("../services/UserService");

const searchForTermAndDate = async (req, res) =>{

    if(!isDateFormatValid(req.body.date)){
        req.session.data = "Invalid date passed. Use format YYYY-MM-DD.";
        return res.status(400).json("Invalid date passed. Use format YYYY-MM-DD.");
    }


    const result = await UserService.countCommitsAndStarsAndTraffic(req.body);
    console.log(result);

    req.session.data = result;

    return res.status(typeof result === "string" ? 400 : 200).json(result);

}



const isDateFormatValid = (date) => {
    const dateRegex = /^(\d{4})-(0[1-9]|1[0-2])-([0-2]\d|3[01])$/;
    const match = dateRegex.exec(date);

    if (!match) {
        return false;
    }

    const year = parseInt(match[1]);
    const month = parseInt(match[2]);
    const day = parseInt(match[3]);

    if (month < 1 || month > 12) {
        return false;
    }

    const maxDay = new Date(year, month, 0).getDate();
    if (day < 1 || day > maxDay) {
        return false;
    }
    return true;
}

module.exports = {
    searchForTermAndDate
}
