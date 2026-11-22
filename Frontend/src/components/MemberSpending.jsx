function formatMoney(amount) {
    return `৳${Number(amount || 0).toLocaleString(
        "en-BD",
        {
            maximumFractionDigits: 2,
        },
    )}`;
}


function MemberSpending({
    expenses = [],
    members = [],
}) {

    const memberTotals = {};


    members.forEach((member) => {

        memberTotals[member.id] = {
            name: member.name,
            hero:
                member.hero_display ||
                member.hero ||
                "Avenger",
            amount: 0,
        };

    });


    expenses.forEach((expense) => {

        const memberId =
            Number(
                expense.paid_by?.id ??
                expense.paid_by,
            );


        const amount =
            Number(expense.amount || 0);


        if (memberTotals[memberId]) {

            memberTotals[memberId].amount +=
                amount;

        }

    });


    const spending =
        Object.values(memberTotals)
            .sort(
                (a, b) =>
                    b.amount - a.amount,
            );


    const highest =
        spending[0]?.amount || 0;


    if (spending.length === 0) {
        return (
            <div className="empty-state">

                <h3>
                    No payment data yet.
                </h3>

                <p>
                    Add expenses to see
                    who paid what.
                </p>

            </div>
        );
    }


    return (
        <div className="member-spending">

            {spending.map(
                (member) => {

                    const percentage =
                        highest > 0
                            ? (member.amount /
                                highest) *
                            100
                            : 0;


                    return (
                        <div
                            className="member-spending-item"
                            key={member.name}
                        >

                            <div className="member-spending-info">

                                <div>

                                    <strong>
                                        {member.name}
                                    </strong>

                                    <span>
                                        {member.hero}
                                    </span>

                                </div>


                                <strong>
                                    {formatMoney(
                                        member.amount,
                                    )}
                                </strong>

                            </div>


                            <div className="member-spending-bar">

                                <div
                                    className="member-spending-fill"
                                    style={{
                                        width:
                                            `${percentage}%`,
                                    }}
                                />

                            </div>

                        </div>
                    );

                },
            )}

        </div>
    );
}


export default MemberSpending;