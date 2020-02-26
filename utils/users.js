const users = []

// Add users 

const addUser = ({id,username,room}) => {
    
    // Clean the data
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    // Validate the data
    if(!username && !room){
        return {
            error:"Username and room are required"
        }
    }

    // check for the existing user 
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    // validate username 
    if(existingUser){
        return {
            error:"username in use"
        }
    }

    const user = {id,username,room}
    users.push(user)
    return {user}
}

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id );

    if(index !== -1){
        return users.splice(index,1)[0]
    }
} 

const getUser = (id) => {{
    const user = users.find((user) => user.id === id)
    if(!user){
        return {
            error:"There is no such a user"
        }
    }
    return {user};
}};

const getUsersInRoom = (room) => {
    const cleanRoom = room.trim().toLowerCase();
    return users.filter((user) => user.room === cleanRoom);
}



module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}