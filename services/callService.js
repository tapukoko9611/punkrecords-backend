const Call = require('../models/callModel');
const User = require('../models/userModel');

const createResponse = (isError, message, data) => ({
    isError,
    message,
    data
});

const findOrCreateCall = async ({ callName, userId, isPrivate = false, password = "" }) => {
    let call = await Call.findOne({ name: callName });
    if (!call) {
        call = await Call.create({
            name: callName,
            createdBy: userId,
            isPrivate,
            password,
            participants: {
                [userId]: { joinedOn: new Date(), isActive: true }
            }
        });
        await User.updateOne(
            { _id: userId },
            {
                $set: {
                    [`calls.${call._id}`]: { isAdmin: true, joinedOn: new Date(), name: callName },
                },
            }
        );
        return createResponse(false, "Call Created", { call });
    }
    return createResponse(false, "Call Found", { call });
};

const checkCallExists = async (callName) => {
    const call = await Call.findOne({ name: callName });
    return createResponse(false, "Call Existence Checked", { call });
};

const joinCall = async ({ callName, userId }) => {
    const { data: { call } } = await findOrCreateCall({ callName, userId, isPrivate: false, password: "" });
    const user = await User.findById(userId);

    if (!call.participants.has(userId)) {
        call.participants.set(userId, { joinedOn: new Date(), isActive: true });
        await call.save();
    }
    if (!user.calls.has(call._id)) {
        user.calls.set(call._id, { isAdmin: call.createdBy == user._id, joinedOn: new Date(), name: callName });
        await user.save();
    }

    return createResponse(false, "Joined Call", { call });
};

const getCallDetails = async (callName, userId) => {
    const call = await findOrCreateCall({ callName, userId, isPrivate: false, password: "" });
    if (!call) {
        return createResponse(true, "Call not found", null);
    }
    return createResponse(false, "Call Details Retrieved", { call });
};

const updateCallMeta = async ({ callName, userId, password, isPrivate }) => {
    const { data: { call } } = await findOrCreateCall({ callName, userId });
    if (!call || String(call.createdBy) !== userId.toString()) {
        return createResponse(true, "No admin privileges", null);
    }
    call.password = password;
    call.isPrivate = isPrivate;
    await call.save();
    return createResponse(false, "Call Metadata Updated", { call });
};

const leaveCall = async ({ callName, userId }) => {
    const call = await findOrCreateCall({ callName, userId, isPrivate: false, password: "" });
    if (!call || !call.participants.has(userId)) {
        return createResponse(true, "Not a participant", null);
    }
    call.participants.delete(userId);
    await call.save();
    await User.updateOne({ _id: userId }, { $unset: { [`calls.${call._id}`]: 1 } });
    return createResponse(false, "Left Call", { call });
};

module.exports = {
    createResponse,
    findOrCreateCall,
    checkCallExists,
    joinCall,
    getCallDetails,
    updateCallMeta,
    leaveCall
};