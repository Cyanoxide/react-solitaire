import { useEffect, useRef, useState } from "react";
import type { CSSProperties, Dispatch, SetStateAction } from "react";
import Button from "../components/Button/Button";
import WindowMenu from "../components/WindowMenu/WindowMenu";
import type { WindowMenuDef } from "../components/WindowMenu/WindowMenu";
import Card from "./Card/Card";
import styles from "./Solitaire.module.scss";
import WinAnimation from "./WinAnimation/WinAnimation";

export type Suit = "hearts" | "diamonds" | "clubs" | "spades";
type Rank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;

export interface CardType {
    id: string;
    suit: Suit;
    rank: Rank;
    isFaceUp: boolean;
}

export interface BoardState {
  deck: CardType[];
  waste: CardType[];
  wasteCount: number;
  foundations: CardType[][];
  board: CardType[][];
  win: boolean;
}

const shuffle = (array: CardType[]) => {
    const shuffled = [...array];

    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled;
};

// Number of card-back designs in the sprite sheet (row 4, columns 0-11)
const CARD_BACK_COUNT = 12;

const suits = ["hearts", "diamonds", "clubs", "spades"] as const;
const deck: CardType[] = suits.flatMap((suit) =>
    Array.from({ length: 13 }, (_, i) => ({
        id: `${suit}-${i + 1}`,
        suit,
        rank: (i + 1) as Rank,
        isFaceUp: false,
    }))
);

const createInitialBoardState = (): BoardState => {
    const shuffledDeck = shuffle(deck);

    const board: CardType[][] = Array.from({ length: 7 }, (_, i) => {
        const start = (i * (i + 1)) / 2;
        const end = start + (i + 1);

        return shuffledDeck.slice(start, end).map((card, index) => ({
            ...card,
            isFaceUp: index === i
        }));
    });

    return {
        deck: shuffledDeck.slice(28),
        waste: [],
        wasteCount: 3,
        foundations: [
            [],
            [],
            [],
            [],
        ],
        board,
        win: false
    };
};

const Solitaire = () => {
    const [boardState, setBoardState] = useState<BoardState>(createInitialBoardState);
    const [showDealPrompt, setShowDealPrompt] = useState(false);
    const [canUndo, setCanUndo] = useState(false);
    // Applied card-back index; deckDialogBack is the pending selection while the
    // Select Card Back dialog is open (null = closed)
    const [cardBack, setCardBack] = useState(0);
    const [deckDialogBack, setDeckDialogBack] = useState<number | null>(null);

    // Single-level undo (XP-authentic): snapshot the state before each move,
    // restore it once, then grey Undo out until the next move
    const boardStateRef = useRef(boardState);
    const undoSnapshotRef = useRef<BoardState | null>(null);
    useEffect(() => { boardStateRef.current = boardState; });

    // Wraps setBoardState for player moves so each move records an undo point.
    // Passed to Card and the deck; the win animation keeps the raw setter.
    const commitBoard: Dispatch<SetStateAction<BoardState>> = (update) => {
        undoSnapshotRef.current = boardStateRef.current;
        setCanUndo(true);
        setBoardState(update);
    };

    const handleUndo = () => {
        if (!undoSnapshotRef.current) return;
        setBoardState(undoSnapshotRef.current);
        undoSnapshotRef.current = null;
        setCanUndo(false);
    };

    // Latch the win once every foundation is complete. It must be state, not a
    // derived value: the win animation pops the foundations as it plays, so a
    // derived flag would flip back to false the moment the first card launches.
    useEffect(() => {
        if (!boardState.foundations || boardState.win) return;
        if (boardState.foundations.every((foundation) => foundation.length === 13)) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setBoardState((prev) => ({ ...prev, win: true }));
        }
    }, [boardState.foundations, boardState.win]);

    // F2 deals a new game (the Game menu advertises this shortcut)
    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "F2") {
                event.preventDefault();
                setShowDealPrompt(false);
                undoSnapshotRef.current = null;
                setCanUndo(false);
                setBoardState(createInitialBoardState());
            }
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, []);

    if (!boardState.board) return;

    const handleDeckOnClick = () => {
        commitBoard((prev: BoardState) => {
            if (prev.deck.length) {
                return {
                    ...prev,
                    deck: prev.deck.slice(0, -1),
                    waste: [...prev.waste, prev.deck[prev.deck.length - 1]],
                    wasteCount: 3,
                };
            }

            return {
                ...prev,
                deck: prev.waste.slice().reverse(),
                waste: []
            };
        });
    };

    const handleCardLaunch = (pileIndex: number) => {
        setBoardState((prev) => ({
            ...prev,
            foundations: prev.foundations.map((foundation, index) =>
                (index === pileIndex) ? foundation.slice(0, -1) : foundation
            ),
        }));
    };

    const handleNewGame = () => {
        setShowDealPrompt(false);
        undoSnapshotRef.current = null;
        setCanUndo(false);
        setBoardState(createInitialBoardState());
    };

    // Animation finished or was skipped: leave the table empty and ask to deal again
    const handleAnimationComplete = () => {
        setBoardState((prev) => ({
            ...prev,
            foundations: [[], [], [], []],
            win: false,
        }));
        setShowDealPrompt(true);
    };

    // Menu definitions. Items are wired up on their own branches; for now the
    // dropdowns open with every option greyed out.
    const menus: WindowMenuDef[] = [
        {
            label: "Game",
            items: [
                { label: "Deal", shortcut: "F2", onClick: handleNewGame },
                { label: "Undo", onClick: handleUndo, disabled: !canUndo },
                { separator: true },
                { label: "Deck...", onClick: () => setDeckDialogBack(cardBack) },
                { label: "Options...", disabled: true },
                { separator: true },
                { label: "Exit", disabled: true },
            ],
        },
        {
            label: "Help",
            items: [
                { label: "Contents", disabled: true },
                { label: "Search for Help on...", disabled: true },
                { label: "Using Help", disabled: true },
                { separator: true },
                { label: "About Solitaire", disabled: true },
            ],
        },
    ];

    return (
        <>
            <WindowMenu menus={menus}/>
            <div className={styles.solitaire} style={{ "--card-back": cardBack } as CSSProperties}>
                <main className={styles.main}>
                    <div className={styles.topRow}>
                        <div className={styles.pileRow}>
                            <div className={styles.deck} onClick={handleDeckOnClick}>
                                {boardState.deck.slice(0, 3).map((card) => <Card key={card.id} {...card}/>)}
                            </div>
                            <div className={styles.waste}>
                                {boardState.waste.slice(-Math.abs(boardState.wasteCount)).map((card) => <Card key={card.id} rank={card.rank} suit={card.suit} isFaceUp={true} setBoardState={commitBoard}/>)}
                            </div>
                        </div>
                        <div className={styles.foundations}>
                            {boardState.foundations.map((item, index) => (
                                <div key={index} data-foundation={index}>
                                    {item.map((card) => <Card key={card.id} setBoardState={commitBoard} {...card}/>)}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className={styles.columns}>
                        {boardState.board.map((item, index) => {
                            return (
                                <div key={index} className={styles.column} data-column={index}>
                                    {item.map((card) => <Card key={card.id} setBoardState={commitBoard} {...card}/>)}
                                </div>
                            );
                        })}
                    </div>
                </main>
                {boardState.win && <WinAnimation foundations={boardState.foundations} onCardLaunch={handleCardLaunch} onComplete={handleAnimationComplete} />}
                {showDealPrompt && (
                    <div className={styles.dialog}>
                        <div className={styles.dialogTitleBar}>Solitaire</div>
                        <div className={`${styles.dialogBody} ${styles.dealPromptBody}`}>
                            <p>Do you want to deal again?</p>
                            <div className={styles.dialogButtons}>
                                <Button onClick={handleNewGame}>Yes</Button>
                                <Button onClick={() => setShowDealPrompt(false)}>No</Button>
                            </div>
                        </div>
                    </div>
                )}
                {deckDialogBack !== null && (
                    <div className={styles.dialog}>
                        <div className={styles.dialogTitleBar}>Select Card Back</div>
                        <div className={styles.dialogBody}>
                            <div className={styles.cardBackGrid}>
                                {Array.from({ length: CARD_BACK_COUNT }, (_, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        className={styles.cardBackOption}
                                        data-selected={index === deckDialogBack}
                                        style={{ "--back-index": index } as CSSProperties}
                                        onClick={() => setDeckDialogBack(index)}
                                        onDoubleClick={() => { setCardBack(index); setDeckDialogBack(null); }}
                                    />
                                ))}
                            </div>
                            <div className={styles.dialogButtons}>
                                <Button onClick={() => { setCardBack(deckDialogBack); setDeckDialogBack(null); }}>OK</Button>
                                <Button onClick={() => setDeckDialogBack(null)}>Cancel</Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default Solitaire;
