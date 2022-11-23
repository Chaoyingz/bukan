type IButtonProps = {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
};

export const IButton = ({ children, className, onClick }: IButtonProps) => {
    return (
        <div
            className={`p-1 hover:bg-ngray-8 rounded flex items-center ${className} cursor-pointer`}
            onClick={onClick}
        >
            {children}
        </div>
    );
};
