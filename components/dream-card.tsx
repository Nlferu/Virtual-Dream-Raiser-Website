import React, { useState, useEffect, ChangeEvent } from "react"
import { CardButton, WithdrawCardButton, DisabledButton } from "./button"
import { useWeb3Contract, useMoralis } from "react-moralis"
import { BigNumber, ethers } from "ethers"
import contract from "@/contracts/VirtualDreamRaiser.json"

type DreamCardProps = {
    dreamId: number
}

const truncateStr = (fullStr: string, strLen: number) => {
    if (fullStr.length <= strLen) return fullStr

    const separator = "..."

    var sepLen = separator.length,
        charsToShow = strLen - sepLen,
        frontChars = Math.ceil(charsToShow / 2),
        backChars = Math.floor(charsToShow / 2)

    return fullStr.substring(0, frontChars) + separator + fullStr.substring(fullStr.length - backChars)
}

export default function DreamCard({ dreamId }: DreamCardProps) {
    const [amount, setAmount] = useState<string>()
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const { isWeb3Enabled, account } = useMoralis()
    const contractAddress = contract.address
    const contractAbi = contract.abi
    let progress = 0

    const {
        runContractFunction: getCreator,
        data: creator,
        error: creatorError,
    } = useWeb3Contract({
        abi: contractAbi,
        contractAddress: contractAddress,
        functionName: "getCreator",
        params: { dreamId: dreamId },
    })

    const {
        runContractFunction: getWallet,
        data: walletz,
        error: walletError,
    } = useWeb3Contract({
        abi: contractAbi,
        contractAddress: contractAddress,
        functionName: "getWithdrawWallet",
        params: { dreamId: dreamId },
    })

    const {
        runContractFunction: getStatus,
        data: status,
        error: statusError,
    } = useWeb3Contract({
        abi: contractAbi,
        contractAddress: contractAddress,
        functionName: "getStatus",
        params: { dreamId: dreamId },
    })

    const {
        runContractFunction: getDescription,
        data: description,
        error: descriptionError,
    } = useWeb3Contract({
        abi: contractAbi,
        contractAddress: contractAddress,
        functionName: "getDescription",
        params: { dreamId: dreamId },
    })

    const {
        runContractFunction: getGathered,
        data: bigGathered,
        error: gatheredError,
    } = useWeb3Contract({
        abi: contractAbi,
        contractAddress: contractAddress,
        functionName: "getTotalGathered",
        params: { dreamId: dreamId },
    })

    const {
        runContractFunction: getGoal,
        data: bigGoal,
        error: goalError,
    } = useWeb3Contract({
        abi: contractAbi,
        contractAddress: contractAddress,
        functionName: "getGoal",
        params: { dreamId: dreamId },
    })

    const {
        runContractFunction: getTimeLeft,
        data: expiration,
        error: expirationError,
    } = useWeb3Contract({
        abi: contractAbi,
        contractAddress: contractAddress,
        functionName: "getTimeLeft",
        params: { dreamId: dreamId },
    })

    const {
        runContractFunction: getPromoted,
        data: promoted,
        error: promotedError,
    } = useWeb3Contract({
        abi: contractAbi,
        contractAddress: contractAddress,
        functionName: "getPromoted",
        params: { dreamId: dreamId },
    })

    useEffect(() => {
        if (isWeb3Enabled) {
            getCreator()
            getWallet()
            getStatus()
            getDescription()
            getGathered()
            getGoal()
            getTimeLeft()
            getPromoted()
        }
    }, [isWeb3Enabled])

    const creatorWallet = truncateStr((creator as string) || "0x0000000000000000000000000000000000000000", 15)
    const wallet = truncateStr((walletz as string) || "0x0000000000000000000000000000000000000000", 15)
    let gathered = 0
    let goal = 0

    if (bigGathered) {
        gathered = parseFloat(ethers.utils.formatEther(bigGathered as BigNumber))
    }

    if (bigGoal) {
        goal = parseFloat(ethers.utils.formatEther(bigGoal as BigNumber))
    }

    progress = (gathered / goal) * 100

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { value } = event.target
        setAmount(value)
    }

    const resetForm = () => {
        setAmount("")
    }

    const handleFundDream = async () => {
        setIsLoading(true)

        try {
            console.log("Funded")
            console.log(account)
            console.log(amount)
        } catch (error) {
            console.log("Error 404 -> just kidding: Some unexpected error occured!")
        } finally {
            setIsLoading(false)
        }

        resetForm()
    }

    return (
        <div className="bg-lightPurple/10 flex flex-col gap-2 items-center justify-center h-[35rem] w-[20rem] border-[1px] border-lightPurple p-3 rounded-lg shadow-md text-darkPurple">
            <h2 className="text-lg font-bold mb-2 flex text-center justify-center items-center text-violet-500/90">Dream ID: {dreamId}</h2>
            <div>
                <strong className="text-cyan-500">Creator:</strong> {creatorWallet}
            </div>
            <div>
                <strong className="text-cyan-500">Designated Wallet:</strong> {wallet}
            </div>

            <div>
                <strong className="text-cyan-500">Status:</strong> {(status as boolean) ? <>true</> : <>false</>}
            </div>

            <div>
                <strong className="flex text-center items-center justify-center text-cyan-500">Description:</strong>{" "}
                <div className="flex flex-wrap text-center min-h-[10rem]">{description as string}</div>
            </div>

            <div>
                Raised <strong className="text-cyan-500">{gathered} ETH</strong> out of <strong className="text-cyan-500">{goal} ETH</strong>
            </div>
            <div className="w-full bg-gray-200 rounded-full dark:bg-gray-700">
                {gathered > goal ? (
                    <div className="bg-lightPurple text-xs font-medium text-cyan-500 text-center p-0.5 leading-none rounded-full" style={{ width: `${100}%` }}>
                        {`${Math.round(progress)}%`}
                    </div>
                ) : (
                    <div
                        className="bg-lightPurple text-xs font-medium text-cyan-500 text-center p-0.5 leading-none rounded-full"
                        style={{ width: `${progress}%` }}
                    >
                        {`${Math.round(progress)}%`}
                    </div>
                )}
            </div>

            <div>
                <strong className="text-cyan-500">Time Left:</strong> {(expiration as BigNumber)?.toNumber()} days left
            </div>

            <div className="my-[0.25rem]">
                <input
                    className="h-10 border-0 rounded-full bg-black/70 hover:bg-devil shadow-lg hover:shadow-xl hover:shadow-lightPurple/50 text-center shadow-lightPurple/50 text-gray-300
                            focus:text-gray-300 placeholder:text-gray-600 focus:outline focus:outline-2 focus:outline-offset-0 focus:outline-darkPurple transition-all duration-75 caret-darkPurple"
                    type="text"
                    name="fund"
                    id="fund"
                    placeholder="Amount (ETH)"
                    value={amount}
                    onChange={handleInputChange}
                ></input>
            </div>

            {isWeb3Enabled && account == (creator as string)?.toLowerCase() ? (
                <div className="flex gap-8">
                    {status ? (
                        <div>
                            <CardButton name="Fund" onClick={handleFundDream} disabled={isLoading} />
                        </div>
                    ) : (
                        <div>
                            <DisabledButton name="Fund" />
                        </div>
                    )}

                    <div>
                        <WithdrawCardButton name="Withdraw" onClick={handleFundDream} disabled={isLoading} />
                    </div>
                </div>
            ) : (
                <div>
                    {status ? (
                        <div>
                            <CardButton name="Fund" onClick={handleFundDream} disabled={isLoading} />
                        </div>
                    ) : (
                        <div>
                            <DisabledButton name="Fund" />
                        </div>
                    )}
                </div>
            )}

            <div>
                <strong>Promoted:</strong> {promoted ? <>true</> : <>false</>}
            </div>
        </div>
    )
}
