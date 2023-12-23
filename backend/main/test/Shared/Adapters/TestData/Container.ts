import {Food} from "src/Shared/Adapters/DB/NishikiDBTypes";

export const CONTAINER_ID1 = "5270d18f-5cbe-4ca8-b491-eaa65e1d6925";
export const CONTAINER_ID2 = "9e24cbf1-eab0-40f1-bef2-687751740a03";

const food1: Food = {
    foodId: "84cff938-fa2b-443f-a814-f4febb62bf75",
    name: "Century Soup",
    unit: "L",
    quantity: 10,
    category: "Soup",
    expiry: "3023-12-23T12:21:10.10",
    createdDatetime: "2023-12-23T12:21:10.10",
}

const food2: Food = {
    foodId: "00e6191d-e4d8-4f70-a211-f00db200fcfe",
    name: "Rainbow Fruit Pudding",
    unit: "L",
    quantity: 10,
    category: "Dessert",
    expiry: "2008-08-10T10:10:10.10",
    createdDatetime: "2008-06-16T00:00:00.00",
}

const food3: Food = {
    foodId: "40d27ebd-9112-40e8-a316-55a5e89fb570",
    name: "God",
    unit: null,
    quantity: null,
    category: null,
    expiry: null,
    createdDatetime: "2010-10-10T00:00:00.00",
}

export const containerData = {
    containerData: [
        {
            containerId: CONTAINER_ID1,
            containerName: "container-1",
            foods: [food1, food2, food3]
        },
        {
            containerId: CONTAINER_ID2,
            containerName: "container-2",
            foods: []
        }
    ]
}