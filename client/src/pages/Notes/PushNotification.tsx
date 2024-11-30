import { Button, Tooltip } from "flowbite-react";
import { GoBellFill } from "react-icons/go";
import { GoBellSlash } from "react-icons/go";

import { usePushNotifications } from "lib/hooks";

const PushNotification = () => {
  const { loading, isSubscribed, subscribe, unsubscribe } =
    usePushNotifications();

  return (
    <>
      {isSubscribed ? (
        <Tooltip content="Unsubscribe from Notifications">
          <Button onClick={unsubscribe} isProcessing={loading}>
            <GoBellSlash className="w-5 h-5" />
          </Button>
        </Tooltip>
      ) : (
        <Tooltip content="Subscribe to Notifications">
          <Button onClick={subscribe} isProcessing={loading}>
            <GoBellFill className="w-5 h-5" />
          </Button>
        </Tooltip>
      )}
    </>
  );
};

export default PushNotification;
