class Base{
    id
    name

    deleted
    createdAt

    changeloglist
}

class Changelog{
    oldversion
    createdBy
    createdAt
}

class User{

}

class Praktijk{
    tandartsen
    users
    patienten
    defaultanswers//product questionanswers
}

class Tandarts{

}

class Patient{
    behandelingen
}

class Comment{
    text
}

//----------------------------------------------

class BehandelingBlauw{
    behandelingstappen
}

class BehandelingstapBlauw{
    duration
    productupper
    productlower
}

class ProductBlauw{
    questions
}

class SupraStructure{
    
}

class QuestionBlauw{
    type//dropdown,number,text,tandselectie
    name
}

class QuestionOption{
    name
}



//----------------------------------

class Behandeling{
    blauw
}

class BehandelingStap{
    blauw

}

class Product{
    blauw

}

class QuestionAnswer{
    blauw
    answer
}
