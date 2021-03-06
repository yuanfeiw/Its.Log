// Copyright (c) Microsoft. All rights reserved. 
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;

namespace Its.Log.Instrumentation.Extensions
{
    /// <summary>
    /// Captures information that can be used to aggregate telemetry information such as success rates and latencies.
    /// </summary>
    public sealed class Telemetry : IApplyOnExit
    {
        private IDictionary<string, object> properties;

        /// <summary>
        /// Initializes the <see cref="Telemetry"/> class.
        /// </summary>
        static Telemetry()
        {
            Formatter<Telemetry>.RegisterForAllMembers();
        }

        /// <summary>
        /// Gets or sets a value indicating whether an operation succeeded.
        /// </summary>
        /// <value>
        ///   <c>true</c> if the operation succeeded; otherwise, <c>false</c>.
        /// </value>
        public bool Succeeded { get; set; }

        /// <summary>
        /// Gets or sets the name of the source operation. By default, this is set to <see cref="LogEntry.CallingMethod" />.
        /// </summary>
        public string OperationName { get; set; }

        /// <summary>
        /// Gets or sets the number of milliseconds that the operation took.
        /// </summary>
        public int ElapsedMilliseconds { get; set; }

        /// <summary>
        /// Gets or sets the HTTP status code of the operation, if applcable.
        /// </summary>
        public HttpStatusCode HttpStatusCode { get; set; }

        /// <summary>
        /// Gets or sets the request URI of the operation, if applicable.
        /// </summary>
        public Uri RequestUri { get; set; }

        public IDictionary<string, object> Properties
        {
            get
            {
                return properties ?? (properties = new Dictionary<string, object>());
            }
        }

        public void OnExit(LogEntry logEntry)
        {
            Succeeded = logEntry.Confirmations
                                .OfType<Telemetry>()
                                .Any();
            OperationName = OperationName ?? logEntry.CallingMethod;
            ElapsedMilliseconds = (int) logEntry.ElapsedMilliseconds;
        }
    }
}